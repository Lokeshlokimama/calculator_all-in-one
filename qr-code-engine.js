(function attachQrEngine(global) {
    'use strict';

    const TOTAL_CODEWORDS = [
        -1, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
        404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
        1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
        2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
    ];

    const ECC_CODEWORDS_PER_BLOCK_M = [
        -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26,
        30, 22, 22, 24, 24, 28, 28, 26, 26, 26,
        26, 28, 28, 28, 28, 28, 28, 28, 28, 28,
        28, 28, 28, 28, 28, 28, 28, 28, 28, 28
    ];

    const ECC_BLOCKS_M = [
        -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5,
        5, 8, 9, 9, 10, 10, 11, 13, 14, 16,
        17, 17, 18, 20, 21, 23, 25, 26, 28, 29,
        31, 33, 35, 37, 38, 40, 43, 45, 47, 49
    ];

    const FORMAT_BITS_MEDIUM = 0;
    const MIN_VERSION = 1;
    const MAX_VERSION = 40;

    const EXP = new Array(512);
    const LOG = new Array(256);
    let gfValue = 1;
    for (let i = 0; i < 255; i += 1) {
        EXP[i] = gfValue;
        LOG[gfValue] = i;
        gfValue <<= 1;
        if (gfValue & 0x100) gfValue ^= 0x11D;
    }
    for (let i = 255; i < EXP.length; i += 1) EXP[i] = EXP[i - 255];

    function multiply(a, b) {
        return a && b ? EXP[LOG[a] + LOG[b]] : 0;
    }

    function getDataCodewordCount(version) {
        return TOTAL_CODEWORDS[version] - ECC_CODEWORDS_PER_BLOCK_M[version] * ECC_BLOCKS_M[version];
    }

    function getCharCountBits(version) {
        return version <= 9 ? 8 : 16;
    }

    class BitBuffer {
        constructor() {
            this.bits = [];
        }

        append(value, length) {
            if (length < 0 || length > 31 || value >>> length !== 0) {
                throw new RangeError('Invalid QR bit append.');
            }
            for (let i = length - 1; i >= 0; i -= 1) {
                this.bits.push((value >>> i) & 1);
            }
        }

        get length() {
            return this.bits.length;
        }

        toBytes() {
            const result = [];
            for (let i = 0; i < this.bits.length; i += 8) {
                let value = 0;
                for (let j = 0; j < 8; j += 1) value = (value << 1) | (this.bits[i + j] || 0);
                result.push(value);
            }
            return result;
        }
    }

    function encodeUtf8(text) {
        if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(text));
        return Array.from(unescape(encodeURIComponent(text)), (char) => char.charCodeAt(0));
    }

    function chooseVersion(bytes) {
        for (let version = MIN_VERSION; version <= MAX_VERSION; version += 1) {
            const neededBits = 4 + getCharCountBits(version) + bytes.length * 8;
            if (neededBits <= getDataCodewordCount(version) * 8) return version;
        }
        throw new RangeError('This QR payload is too long. Keep the encoded data under about 2,300 bytes.');
    }

    function createDataCodewords(text, version) {
        const bytes = encodeUtf8(text);
        const capacityBits = getDataCodewordCount(version) * 8;
        const buffer = new BitBuffer();

        buffer.append(0x4, 4); // Byte mode
        buffer.append(bytes.length, getCharCountBits(version));
        bytes.forEach((byte) => buffer.append(byte, 8));

        buffer.append(0, Math.min(4, capacityBits - buffer.length));
        while (buffer.length % 8 !== 0) buffer.append(0, 1);

        for (let pad = 0xEC; buffer.length < capacityBits; pad ^= 0xEC ^ 0x11) {
            buffer.append(pad, 8);
        }
        return buffer.toBytes();
    }

    function reedSolomonDivisor(degree) {
        const result = new Array(degree).fill(0);
        result[degree - 1] = 1;
        let root = 1;
        for (let i = 0; i < degree; i += 1) {
            for (let j = 0; j < degree; j += 1) {
                result[j] = multiply(result[j], root);
                if (j + 1 < degree) result[j] ^= result[j + 1];
            }
            root = multiply(root, 0x02);
        }
        return result;
    }

    function reedSolomonRemainder(data, divisor) {
        const result = new Array(divisor.length).fill(0);
        data.forEach((byte) => {
            const factor = byte ^ result.shift();
            result.push(0);
            divisor.forEach((coefficient, index) => {
                result[index] ^= multiply(coefficient, factor);
            });
        });
        return result;
    }

    function addEccAndInterleave(data, version) {
        const totalCodewords = TOTAL_CODEWORDS[version];
        const blockCount = ECC_BLOCKS_M[version];
        const blockEccLength = ECC_CODEWORDS_PER_BLOCK_M[version];
        const shortBlockLength = Math.floor(totalCodewords / blockCount);
        const shortBlockCount = blockCount - (totalCodewords % blockCount);
        const rsDivisor = reedSolomonDivisor(blockEccLength);
        const blocks = [];
        let dataIndex = 0;

        for (let blockIndex = 0; blockIndex < blockCount; blockIndex += 1) {
            const dataLength = shortBlockLength - blockEccLength + (blockIndex < shortBlockCount ? 0 : 1);
            const blockData = data.slice(dataIndex, dataIndex + dataLength);
            dataIndex += dataLength;
            const blockEcc = reedSolomonRemainder(blockData, rsDivisor);
            if (blockIndex < shortBlockCount) blockData.push(0);
            blocks.push(blockData.concat(blockEcc));
        }

        const result = [];
        for (let i = 0; i < blocks[0].length; i += 1) {
            blocks.forEach((block, blockIndex) => {
                if (i !== shortBlockLength - blockEccLength || blockIndex >= shortBlockCount) {
                    result.push(block[i]);
                }
            });
        }
        return result;
    }

    function getAlignmentPositions(version) {
        if (version === 1) return [];
        const size = version * 4 + 17;
        const count = Math.floor(version / 7) + 2;
        const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
        const result = [6];
        for (let position = size - 7; result.length < count; position -= step) {
            result.splice(1, 0, position);
        }
        return result;
    }

    function getFormatBits(mask) {
        let data = (FORMAT_BITS_MEDIUM << 3) | mask;
        let remainder = data;
        for (let i = 0; i < 10; i += 1) {
            remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) ? 0x537 : 0);
        }
        return ((data << 10) | (remainder & 0x3FF)) ^ 0x5412;
    }

    function getVersionBits(version) {
        let remainder = version;
        for (let i = 0; i < 12; i += 1) {
            remainder = (remainder << 1) ^ (((remainder >>> 11) & 1) ? 0x1F25 : 0);
        }
        return (version << 12) | (remainder & 0xFFF);
    }

    class QrMatrix {
        constructor(version) {
            this.version = version;
            this.size = version * 4 + 17;
            this.modules = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
            this.functionModules = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
        }

        setFunction(x, y, dark) {
            this.modules[y][x] = dark;
            this.functionModules[y][x] = true;
        }

        drawFunctionPatterns() {
            const size = this.size;
            this.drawFinder(3, 3);
            this.drawFinder(size - 4, 3);
            this.drawFinder(3, size - 4);

            for (let i = 0; i < size; i += 1) {
                if (!this.functionModules[6][i]) this.setFunction(i, 6, i % 2 === 0);
                if (!this.functionModules[i][6]) this.setFunction(6, i, i % 2 === 0);
            }

            const align = getAlignmentPositions(this.version);
            align.forEach((x) => {
                align.forEach((y) => {
                    if (!this.functionModules[y][x]) this.drawAlignment(x, y);
                });
            });

            this.drawFormatBits(0);
            if (this.version >= 7) this.drawVersionBits();
            this.setFunction(8, size - 8, true);
        }

        drawFinder(cx, cy) {
            for (let dy = -4; dy <= 4; dy += 1) {
                for (let dx = -4; dx <= 4; dx += 1) {
                    const x = cx + dx;
                    const y = cy + dy;
                    if (x < 0 || y < 0 || x >= this.size || y >= this.size) continue;
                    const distance = Math.max(Math.abs(dx), Math.abs(dy));
                    this.setFunction(x, y, distance !== 2 && distance !== 4);
                }
            }
        }

        drawAlignment(cx, cy) {
            for (let dy = -2; dy <= 2; dy += 1) {
                for (let dx = -2; dx <= 2; dx += 1) {
                    this.setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) === 2 || (dx === 0 && dy === 0));
                }
            }
        }

        drawFormatBits(mask) {
            const bits = getFormatBits(mask);
            for (let i = 0; i <= 5; i += 1) this.setFunction(8, i, ((bits >>> i) & 1) !== 0);
            this.setFunction(8, 7, ((bits >>> 6) & 1) !== 0);
            this.setFunction(8, 8, ((bits >>> 7) & 1) !== 0);
            this.setFunction(7, 8, ((bits >>> 8) & 1) !== 0);
            for (let i = 9; i < 15; i += 1) this.setFunction(14 - i, 8, ((bits >>> i) & 1) !== 0);

            for (let i = 0; i < 8; i += 1) this.setFunction(this.size - 1 - i, 8, ((bits >>> i) & 1) !== 0);
            for (let i = 8; i < 15; i += 1) this.setFunction(8, this.size - 15 + i, ((bits >>> i) & 1) !== 0);
            this.setFunction(8, this.size - 8, true);
        }

        drawVersionBits() {
            const bits = getVersionBits(this.version);
            for (let i = 0; i < 18; i += 1) {
                const dark = ((bits >>> i) & 1) !== 0;
                const a = this.size - 11 + (i % 3);
                const b = Math.floor(i / 3);
                this.setFunction(a, b, dark);
                this.setFunction(b, a, dark);
            }
        }

        drawCodewords(codewords) {
            let bitIndex = 0;
            const bitLength = codewords.length * 8;
            for (let right = this.size - 1; right >= 1; right -= 2) {
                if (right === 6) right = 5;
                for (let vertical = 0; vertical < this.size; vertical += 1) {
                    for (let j = 0; j < 2; j += 1) {
                        const x = right - j;
                        const upward = ((right + 1) & 2) === 0;
                        const y = upward ? this.size - 1 - vertical : vertical;
                        if (this.functionModules[y][x] || bitIndex >= bitLength) continue;
                        this.modules[y][x] = ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) !== 0;
                        bitIndex += 1;
                    }
                }
            }
        }

        applyMask(mask) {
            for (let y = 0; y < this.size; y += 1) {
                for (let x = 0; x < this.size; x += 1) {
                    if (!this.functionModules[y][x] && maskApplies(mask, x, y)) {
                        this.modules[y][x] = !this.modules[y][x];
                    }
                }
            }
        }

        clone() {
            const copy = new QrMatrix(this.version);
            copy.modules = this.modules.map((row) => row.slice());
            copy.functionModules = this.functionModules.map((row) => row.slice());
            return copy;
        }
    }

    function maskApplies(mask, x, y) {
        switch (mask) {
            case 0: return (x + y) % 2 === 0;
            case 1: return y % 2 === 0;
            case 2: return x % 3 === 0;
            case 3: return (x + y) % 3 === 0;
            case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
            case 5: return ((x * y) % 2 + (x * y) % 3) === 0;
            case 6: return (((x * y) % 2 + (x * y) % 3) % 2) === 0;
            case 7: return (((x + y) % 2 + (x * y) % 3) % 2) === 0;
            default: throw new RangeError('Invalid QR mask.');
        }
    }

    function finderPenaltyLine(bits) {
        let penalty = 0;
        for (let i = 0; i <= bits.length - 7; i += 1) {
            const found = bits[i] && !bits[i + 1] && bits[i + 2] && bits[i + 3] && bits[i + 4] && !bits[i + 5] && bits[i + 6];
            if (!found) continue;
            const before = i >= 4 && !bits[i - 1] && !bits[i - 2] && !bits[i - 3] && !bits[i - 4];
            const after = i + 11 <= bits.length && !bits[i + 7] && !bits[i + 8] && !bits[i + 9] && !bits[i + 10];
            if (before || after) penalty += 40;
        }
        return penalty;
    }

    function penaltyScore(matrix) {
        const size = matrix.size;
        let penalty = 0;
        let dark = 0;

        for (let y = 0; y < size; y += 1) {
            let runColor = matrix.modules[y][0];
            let runLength = 1;
            const row = [];
            for (let x = 0; x < size; x += 1) {
                const moduleDark = matrix.modules[y][x];
                if (moduleDark) dark += 1;
                row.push(moduleDark);
                if (x === 0) continue;
                if (moduleDark === runColor) {
                    runLength += 1;
                    if (runLength === 5) penalty += 3;
                    else if (runLength > 5) penalty += 1;
                } else {
                    runColor = moduleDark;
                    runLength = 1;
                }
            }
            penalty += finderPenaltyLine(row);
        }

        for (let x = 0; x < size; x += 1) {
            let runColor = matrix.modules[0][x];
            let runLength = 1;
            const column = [];
            for (let y = 0; y < size; y += 1) {
                const moduleDark = matrix.modules[y][x];
                column.push(moduleDark);
                if (y === 0) continue;
                if (moduleDark === runColor) {
                    runLength += 1;
                    if (runLength === 5) penalty += 3;
                    else if (runLength > 5) penalty += 1;
                } else {
                    runColor = moduleDark;
                    runLength = 1;
                }
            }
            penalty += finderPenaltyLine(column);
        }

        for (let y = 0; y < size - 1; y += 1) {
            for (let x = 0; x < size - 1; x += 1) {
                const color = matrix.modules[y][x];
                if (color === matrix.modules[y][x + 1] && color === matrix.modules[y + 1][x] && color === matrix.modules[y + 1][x + 1]) {
                    penalty += 3;
                }
            }
        }

        const total = size * size;
        const balancePenalty = Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;
        return penalty + balancePenalty;
    }

    function encode(text) {
        const value = String(text || '');
        if (!value.trim()) throw new Error('Enter text or a formatted QR request to encode.');
        const bytes = encodeUtf8(value);
        const version = chooseVersion(bytes);
        const data = createDataCodewords(value, version);
        const codewords = addEccAndInterleave(data, version);
        const base = new QrMatrix(version);
        base.drawFunctionPatterns();
        base.drawCodewords(codewords);

        let bestMatrix = null;
        let bestMask = 0;
        let bestPenalty = Infinity;
        for (let mask = 0; mask < 8; mask += 1) {
            const candidate = base.clone();
            candidate.applyMask(mask);
            candidate.drawFormatBits(mask);
            const score = penaltyScore(candidate);
            if (score < bestPenalty) {
                bestMatrix = candidate;
                bestMask = mask;
                bestPenalty = score;
            }
        }

        return {
            modules: bestMatrix.modules.map((row) => row.slice()),
            size: bestMatrix.size,
            version,
            mask: bestMask,
            bytes: bytes.length,
            errorCorrection: 'M'
        };
    }

    function normalizeColor(value, fallback) {
        return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback;
    }

    function toSvg(text, options = {}) {
        const qr = encode(text);
        const margin = Math.max(0, Number(options.margin ?? 4));
        const foreground = normalizeColor(options.color, '#000000');
        const background = normalizeColor(options.background, '#ffffff');
        const viewSize = qr.size + margin * 2;
        const paths = [];

        qr.modules.forEach((row, y) => {
            row.forEach((dark, x) => {
                if (dark) paths.push(`M${x + margin},${y + margin}h1v1h-1z`);
            });
        });

        return {
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${background}"/><path d="${paths.join('')}" fill="${foreground}"/></svg>`,
            meta: qr
        };
    }

    function toDataUrl(text, options = {}) {
        if (typeof document === 'undefined') throw new Error('Canvas rendering requires a browser document.');
        const qr = encode(text);
        const targetSize = Math.max(160, Math.min(1200, Number(options.size || 320)));
        const margin = Math.max(2, Math.min(8, Number(options.margin ?? 4)));
        const scale = Math.max(2, Math.floor(targetSize / (qr.size + margin * 2)));
        const canvasSize = (qr.size + margin * 2) * scale;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const foreground = normalizeColor(options.color, '#000000');
        const background = normalizeColor(options.background, '#ffffff');

        canvas.width = canvasSize;
        canvas.height = canvasSize;
        context.fillStyle = background;
        context.fillRect(0, 0, canvasSize, canvasSize);
        context.fillStyle = foreground;
        qr.modules.forEach((row, y) => {
            row.forEach((dark, x) => {
                if (dark) context.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
            });
        });

        return { dataUrl: canvas.toDataURL('image/png'), canvasSize, meta: qr };
    }

    function renderToImage(text, image, options = {}) {
        const rendered = toDataUrl(text, options);
        if (image) {
            image.src = rendered.dataUrl;
            image.hidden = false;
            image.style.display = 'block';
        }
        return rendered;
    }

    const api = { encode, toSvg, toDataUrl, renderToImage };
    global.CalculatorQRCode = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
