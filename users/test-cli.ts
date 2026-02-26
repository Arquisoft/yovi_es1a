import axios from 'axios';
import readline from 'readline';
import fs from 'fs';       
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { execSync } from 'child_process';
import { saveMatch, getMatchHistory } from './src/service/match-service';

const API_URL = 'http://localhost:3000';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentUserId: string | null = null; 
let currentUserName: string | null = null;

const question = (query: string): Promise<string> => 
    new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('=== YOVI: GUI GESTION ===');
    if (currentUserName) {
        console.log(`Actually user: ${currentUserName}`);
    }
    console.log('1. Register');
    console.log('2. Login');
    console.log('3. Play match (Rust)');
    console.log('4. See my statistics');
    console.log('5. Exit');

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
            currentUserId = res.data.userId;
            currentUserName = res.data.username;
        } catch (err: any) {
            console.error('\nAccess fail:', err.response?.data?.error || err.message);
        }
    } 
    else if (choice === '3') {
        if (!currentUserId) {
            console.log('\nYou must log in first to play and save your game!');
        } else {
            console.log('\nStarting game...');
            try {
                const startTime = Date.now();

                execSync('cargo run -- --mode computer --bot monte_carlo_bot', { 
                    cwd: '../gamey', 
                    stdio: 'inherit' 
                }); // NOSONAR

                const endTime = Date.now();
                const durationSeconds = Math.max(1, Math.floor((endTime - startTime) / 1000));

                console.log('\nMatch finished! Reading results from game engine...');

                const resultsPath = path.join(__dirname, '../gamey/resultados_temp.json');

                if (fs.existsSync(resultsPath)) {
                    const rawData = fs.readFileSync(resultsPath, 'utf-8');
                    const gameData = JSON.parse(rawData);
                    let finalResult = gameData.result;

                    console.log(`\nDetected Stats from Engine:`);
                    console.log(`- Result: ${finalResult.toUpperCase()}`);
                    console.log(`- Board Size: ${gameData.board_size}`);
                    console.log(`- Bot: ${gameData.bot_used}`);
                    console.log(`- Duration: ${durationSeconds} seconds`);

                    const res = await axios.post(`${API_URL}/matches/save`, { 
                        userId: currentUserId, 
                        result: finalResult, 
                        duration: durationSeconds, 
                        boardSize: gameData.board_size ,
                        opponent: gameData.bot_used,
                        totalMoves: gameData.total_moves,
                        gameMode: gameData.mode
                    });

                    console.log('\nStats successfully saved to Database!', res.data.message);

                    fs.unlinkSync(resultsPath); 

                } else {
                    console.error("\n Error: No se encontró el archivo de resultados 'resultados_temp.json'.");
                    console.error("¿El juego terminó correctamente o se cerró forzosamente?");
                }

            } catch (err: any) {
                console.error('nError saving match:', err.response?.data?.error || err.message);
            }
        }
    } else if (choice === '4') {
        if (!currentUserId) {
            console.log('\nYou must log in first to see your statistics!');
        } else {
            console.log('\nLoading your statistics...');
            try {
                const res = await axios.get(`${API_URL}/matches/history/${currentUserId}`);
                const history = res.data;
                
                console.log(`\n=== MATCH HISTORY OF ${currentUserName?.toUpperCase()} ===`);
                if (history.length === 0) {
                    console.log('You havent played any games yet.');
                } else {
                    history.forEach((match: any, index: number) => {
                        const date = new Date(match.createdAt).toLocaleDateString();
                        console.log(`${index + 1}. [${match.result.toUpperCase()}] vs ${match.opponent} (${match.totalMoves} moves)`);
                        console.log(`   Time: ${match.duration}s | Size: ${match.boardSize}x${match.boardSize} | Date: ${date}`);
                        console.log('------------------------------------------------');
                    });
                }
                console.log('=========================================');
            } catch (err: any) {
                console.error('\nError retrieving history:', err.response?.data?.error || err.message);
            }
        }
    }
    else if (choice === '5') {
        console.log('Leaving... See you soon!');
        rl.close();
        process.exit(0);
    } 
    else {
        console.log('Incorrect option.');
    }

    main();
}

main();