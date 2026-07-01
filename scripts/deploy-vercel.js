const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const envPath = path.join(__dirname, '../.env.local');

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function run() {
    console.log('🚀 Iniciando proceso de despliegue en Vercel...');

    // 1. Verificar si está logueado en Vercel
    try {
        console.log('🔍 Verificando sesión en Vercel...');
        execSync('npx vercel whoami', { stdio: 'ignore' });
        console.log('✅ Sesión activa detectada en Vercel.');
    } catch (e) {
        console.log('⚠️ No se detectó una sesión activa en Vercel.');
        console.log('🔑 Iniciando flujo de login en Vercel. Por favor, sigue las instrucciones en pantalla...');
        
        // Ejecutar login de forma interactiva
        try {
            execSync('npx vercel login', { stdio: 'inherit' });
        } catch (err) {
            console.error('❌ Error al iniciar sesión en Vercel:', err.message);
            process.exit(1);
        }
    }

    // 2. Enlazar el proyecto a Vercel
    console.log('\n🔗 Enlazando el proyecto a Vercel...');
    try {
        execSync('npx vercel link --yes', { stdio: 'inherit' });
        console.log('✅ Proyecto enlazado correctamente a Vercel.');
    } catch (err) {
        console.error('❌ Error al enlazar el proyecto a Vercel. Asegúrate de estar logueado correctamente.');
        process.exit(1);
    }

    // 3. Leer y subir variables de entorno desde .env.local
    if (!fs.existsSync(envPath)) {
        console.log('⚠️ No se encontró el archivo .env.local. Se omitirá la configuración de variables de entorno.');
    } else {
        console.log('\n📦 Leyendo variables de entorno de .env.local...');
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

        console.log(`📋 Se encontraron ${envVariables.length} variables para subir.`);
        
        const confirmVars = await askQuestion('¿Deseas subir estas variables de entorno a Vercel automáticamente? (s/n): ');
        if (confirmVars.toLowerCase() === 's' || confirmVars.toLowerCase() === 'y' || confirmVars === '') {
            for (const { key, value } of envVariables) {
                try {
                    console.log(`📤 Subiendo variable: ${key}...`);
                    // Intentamos eliminarla primero si ya existe para evitar conflictos de sobrescritura
                    try {
                        execSync(`npx vercel env rm ${key} -y`, { stdio: 'ignore' });
                    } catch (e) {
                        // Ignorar si no existe previamente
                    }
                    
                    // Agregar la variable de entorno para production, preview y development
                    execSync(`npx vercel env add ${key} "${value.replace(/"/g, '\\"')}" production,preview,development`, { stdio: 'ignore' });
                } catch (err) {
                    console.error(`❌ Error al subir la variable ${key}:`, err.message);
                }
            }
            console.log('✅ Variables de entorno subidas con éxito.');
        } else {
            console.log('⚠️ Se omitió la subida de variables de entorno.');
        }
    }

    // 4. Desplegar
    console.log('\n🚀 Desplegando proyecto a producción en Vercel...');
    try {
        execSync('npx vercel --prod', { stdio: 'inherit' });
        console.log('\n🎉 ¡Despliegue completado con éxito!');
    } catch (err) {
        console.error('❌ Error durante el despliegue:', err.message);
        process.exit(1);
    }
}

run();
