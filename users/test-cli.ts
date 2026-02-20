import axios from 'axios';
import readline from 'readline';

const API_URL = 'http://localhost:3000';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => 
    new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('\n=== YOVI: GUI GESTION ===');
    console.log('1. Register');
    console.log('2. Login ');
    console.log('3. Exit');

    const choice = await question('\nChoose an option (number): ');

    if (choice === '1') {
        const username = await question('Username: ');
        const email = await question('Email: ');
        const password = await question('Password: ');

        try {
            const res = await axios.post(`${API_URL}/createuser`, { username, email, password });
            console.log('\n Successfully registered:', res.data.message);
        } catch (err: any) {
            console.error('\nError:', err.response?.data?.error || err.message);
        }
    } 
    else if (choice === '2') {
        const username = await question('Username: ');
        const password = await question('Password: ');

        try {
            const res = await axios.post(`${API_URL}/login`, { username, password });
            console.log('\n Welcome back,', res.data.username);
            console.log('ID:', res.data.userId);
        } catch (err: any) {
            console.error('\nAccess fail:', err.response?.data?.error || err.message);
        }
    } 
    else if (choice === '3') {
        console.log('Exit...');
        rl.close();
        process.exit(0);
    } 
    else {
        console.log('Incorrect option.');
    }

    main();
}

main();