#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkN8nConfigSchema() {
  try {
    // Verificar o schema da tabela n8n_configurations
    const { data, error } = await supabase
      .from('n8n_configurations')
      .select('*')
      .limit(0);

    if (error) {
      console.error('Erro ao verificar schema da tabela n8n_configurations:', error);
      return;
    }

    console.log('Schema da tabela n8n_configurations verificado com sucesso!');
    console.log('A tabela existe e pode ser acessada.');

    // Tentar buscar uma configuração para ver as colunas disponíveis
    const { data: configs, error: configError } = await supabase
      .from('n8n_configurations')
      .select('*')
      .limit(1);

    if (configError) {
      console.error('Erro ao buscar configurações:', configError);
    } else {
      console.log('\n=== Exemplo de estrutura de dados ===');
      if (configs && configs.length > 0) {
        console.log('Colunas encontradas:', Object.keys(configs[0]));
        console.log('Dados de exemplo:', configs[0]);
      } else {
        console.log('Nenhuma configuração encontrada na tabela.');
      }
    }

    // Verificar templates também
    const { data: templates, error: templateError } = await supabase
      .from('n8n_workflow_templates')
      .select('*')
      .limit(1);

    if (templateError) {
      console.error('Erro ao buscar templates:', templateError);
    } else {
      console.log('\n=== Templates disponíveis ===');
      if (templates && templates.length > 0) {
        console.log('Colunas do template:', Object.keys(templates[0]));
        console.log('Template de exemplo:', templates[0]);
      } else {
        console.log('Nenhum template encontrado.');
      }
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkN8nConfigSchema();
