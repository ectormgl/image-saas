import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ibrywlgszctqthddiknt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnl3bGdzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODQsImV4cCI6MjA2MzY5Nzc4NH0.ENmovJ4olXKn2iHQnnsd3JjeAXWOvITQsiIsS8tHt6A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySharedWorkflowMigration() {
    console.log('🚀 Aplicando migração de workflow compartilhado...\n');
    
    try {
        // Ler e executar a migração
        const migrationSQL = fs.readFileSync('./supabase/migrations/008_shared_workflow_approach.sql', 'utf8');
        
        // Dividir em comandos individuais (evitar problemas com múltiplas statements)
        const commands = migrationSQL
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        console.log(`📝 Executando ${commands.length} comandos...\n`);
        
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command) {
                try {
                    console.log(`Comando ${i + 1}/${commands.length}: ${command.substring(0, 100)}...`);
                    const { error } = await supabase.rpc('execute_sql', { sql_query: command });
                    if (error) {
                        console.error(`❌ Erro no comando ${i + 1}:`, error);
                    } else {
                        console.log(`✅ Comando ${i + 1} executado com sucesso`);
                    }
                } catch (err) {
                    console.error(`❌ Erro ao executar comando ${i + 1}:`, err);
                }
            }
        }
        
        console.log('\n✅ Migração concluída!');
        
    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error);
    }
}

applySharedWorkflowMigration();
