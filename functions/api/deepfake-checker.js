import { Buffer } from 'node:buffer';
import deepfakeHandler from '../../api/deepfake-checker.js';

function createNodeResponse(resolve) {
    const headers = new Headers();
    let completed = false;

    return {
        statusCode: 200,
        setHeader(name, value) {
            headers.set(name, String(value));
        },
        end(body = '') {
            if (completed) return;
            completed = true;
            resolve(new Response(body, { status: this.statusCode, headers }));
        }
    };
}

export async function onRequest({ request, env }) {
    let body;
    try {
        body = Buffer.from(await request.arrayBuffer());
    } catch {
        return Response.json({ error: { code: 'INVALID_REQUEST_BODY', message: 'The request body could not be read.' } }, { status: 400 });
    }

    const nodeRequest = {
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body
    };

    return new Promise((resolve) => {
        const nodeResponse = createNodeResponse(resolve);
        Promise.resolve(deepfakeHandler(nodeRequest, nodeResponse, env)).catch(() => {
            nodeResponse.statusCode = 500;
            nodeResponse.end(JSON.stringify({
                error: { code: 'SERVER_ERROR', message: 'The server could not process this request.' }
            }));
        });
    });
}
