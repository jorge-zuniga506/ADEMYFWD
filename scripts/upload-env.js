const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.join(__dirname, '../.env.local');

async function run() {
    if (!fs.existsSync(envPath)) {
        console.error('Error: No se encontró el archivo .env.local');
        process.exit(1);
    }

    console.log('📦 Leyendo variables de entorno de .env.local...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    const envVariables = [];
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        
        const firstEquals = line.indexOf('=');
        if (firstEquals === -1) continue;
        
        const key = line.substring(0, firstEquals).trim();
        let value = line.substring(firstEquals + 1).trim();
        
        // Quitar comillas si las tiene
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        }
        
        if (key && value) {
            envVariables.push({ key, value });
        }
    }

    console.log(`📋 Se encontraron ${envVariables.length} variables. Subiendo a Vercel...`);
    
    for (const { key, value } of envVariables) {
        try {
            console.log(`📤 Subiendo variable: ${key}...`);
            // Intentamos eliminarla si ya existe para evitar errores
            try {
                execSync(`npx vercel env rm ${key} -y`, { stdio: 'ignore' });
            } catch (e) {
                // Ignorar
            }
            
            // Subir variable a Vercel para todos los entornos
            execSync(`npx vercel env add ${key} production,preview,development --value "${value.replace(/"/g, '\\"')}" --yes`, { stdio: 'inherit' });
            console.log(`✅ ${key} subida con éxito.`);
        } catch (err) {
            console.error(`❌ Error al subir la variable ${key}:`);
            if (err.stdout) console.error(err.stdout.toString());
            if (err.stderr) console.error(err.stderr.toString());
            console.error(err.message);
        }
    }
    console.log('🎉 Todas las variables de entorno se han subido a Vercel.');
}

run();
