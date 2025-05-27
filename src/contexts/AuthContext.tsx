

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Iniciando signup para:', email);
      
      // Step 1: Create user account with email confirmation disabled
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          // Disable email confirmation to get immediate user creation
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        console.error('Erro no signup:', error);
        
        // If it's a database error, try a different approach
        if (error.message.includes('Database error')) {
          console.log('Tentando signup sem trigger automático...');
          
          // Try with minimal data
          const { data: retryData, error: retryError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (retryError) {
            return { error: retryError };
          }
          
          console.log('Signup básico bem-sucedido, criando perfil manualmente...');
          
          // Manually create profile
          if (retryData.user) {
            try {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
              
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: retryData.user.id,
                  email: retryData.user.email,
                  name: name,
                });
              
              if (profileError) {
                console.warn('Aviso: Falha ao criar perfil:', profileError);
              } else {
                console.log('Perfil criado manualmente com sucesso');
              }
            } catch (profileErr) {
              console.warn('Aviso: Exceção ao criar perfil:', profileErr);
            }
          }
          
          return { error: null };
        }
        
        return { error };
      }

      console.log('Signup bem-sucedido:', data);
      return { error: null };
    } catch (error) {
      console.error('Exceção no signup:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Signin error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Signout error:', error);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
