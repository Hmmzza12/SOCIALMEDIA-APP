import http from 'http';

function request(method: string, path: string, body?: any, token?: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const options: http.RequestOptions = {
            hostname: 'localhost',
            port: 3010,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            (options.headers as any)['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    try {
        const suffix = Date.now();

        // 1. Signup User A
        console.log('Registering User A...');
        const resA = await request('POST', '/auth/signup', {
            username: `userA_${suffix}`,
            email: `userA_${suffix}@test.com`,
            password: 'password123'
        });
        console.log('User A:', resA.status, resA.data.user?.username);
        const tokenA = resA.data.accessToken;

        // 2. Signup User B
        console.log('Registering User B...');
        const resB = await request('POST', '/auth/signup', {
            username: `userB_${suffix}`,
            email: `userB_${suffix}@test.com`,
            password: 'password123'
        });
        console.log('User B:', resB.status, resB.data.user?.username);
        const idB = resB.data.user.id;

        // 3. Create Conversation
        console.log(`Creating conversation A -> B (${idB})...`);
        const resChat = await request('POST', '/chat/conversations', { partnerId: idB }, tokenA);
        console.log('Create Chat:', resChat.status, resChat.data);

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
