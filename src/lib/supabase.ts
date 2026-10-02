// =====================================================================
// FinTrack: cliente do Supabase
// =====================================================================

// O polyfill precisa ser o primeiro import (o supabase-js usa a API URL).
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// 1) VARIÁVEIS DE AMBIENTE ---------------------------------------------
// O Expo só expõe variáveis que começam com EXPO_PUBLIC_.
// Use sempre `process.env.NOME` direto (sem desestruturar), senão o
// Expo não consegue substituir o valor no build.

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    'Variáveis do Supabase ausentes. Confira o .env e reinicie com: npx expo start -c',
  );
}

// 2) CLIENTE -----------------------------------------------------------

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,       // guarda a sessão no aparelho
    autoRefreshToken: true,      // renova o token automaticamente
    persistSession: true,        // mantém o login entre aberturas do app
    detectSessionInUrl: false,   // não se aplica ao React Native
  },
});

// 3) RENOVAÇÃO DO TOKEN ------------------------------------------------
// Renova o token só enquanto o app está em primeiro plano,
// para não gastar bateria e rede em segundo plano.

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});