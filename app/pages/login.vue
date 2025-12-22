<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

useHead({
    title: 'Login'
})

const { login } = useAuth();
const router = useRouter();

// Estado para feedback visual
const isLoading = ref(false)
const errorMessage = ref('')

const form = ref({
    email: '',
    password: ''
})

const handleLogin = async () => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
        const success = await login(form.value);
        if (success) {
            router.push('/dashboard')
        } else {
            errorMessage.value = 'Email ou senha incorretos.'
        }
    } catch (e) {
        errorMessage.value = 'Erro ao conectar com o servidor.'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            
            <div class="card-header">
                <h1 class="title">Bem-vindo</h1>
                <p class="subtitle">Acesse o sistema para continuar</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
                
                <div v-if="errorMessage" class="error-alert">
                    {{ errorMessage }}
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                        id="email"
                        v-model="form.email" 
                        type="text" 
                        placeholder="exemplo@empresa.com" 
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="password">Senha</label>
                    <input 
                        id="password"
                        v-model="form.password" 
                        type="password" 
                        placeholder="••••••••" 
                        required
                    />
                </div>

                <button type="submit" class="submit-btn" :disabled="isLoading">
                    <span v-if="isLoading">Entrando...</span>
                    <span v-else>Entrar</span>
                </button>
            </form>

        </div>
    </div>
</template>

<style scoped>
/* 1. O Fundo (Dominante - 60%) */
/* Usamos um gradiente diagonal para parecer mais moderno que uma cor sólida */
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Gradiente do Azul Escuro (#0f172a) para um Azul Petróleo (#334155) */
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 1rem;
}

/* 2. O Cartão (Base - 30%) */
.login-card {
    background: rgba(255, 255, 255, 0.95); /* Branco com leve transparência */
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    border-radius: 16px;
    /* Sombra colorida (azulada) em vez de preta deixa o visual mais "limpo" */
    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.3), 0 8px 10px -6px rgba(15, 23, 42, 0.2);
    backdrop-filter: blur(10px); /* Efeito de vidro fosco se o fundo tiver detalhes */
}

.card-header {
    text-align: center;
    margin-bottom: 2rem;
}

.title {
    font-size: 1.8rem;
    font-weight: 800;
    /* Texto em Azul Escuro para harmonia, não preto puro */
    color: #1e3a8a; 
    margin: 0 0 0.5rem 0;
}

.subtitle {
    color: #64748b; /* Cinza azulado */
    font-size: 0.95rem;
    margin: 0;
}

/* Formulário */
.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155; /* Slate 700 */
}

input {
    padding: 0.75rem 1rem;
    border: 1px solid #cbd5e1; /* Slate 300 */
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    outline: none;
    background-color: #f8fafc; /* Fundo levemente cinza no input */
}

/* O foco agora brilha com a cor do destaque */
input:focus {
    border-color: #3b82f6; /* Azul vibrante */
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

input::placeholder {
    color: #94a3b8;
}

/* 3. Botão de Ação (Destaque - 10%) */
.submit-btn {
    margin-top: 0.5rem;
    /* Gradiente no botão para dar volume */
    background: linear-gradient(to right, #2563eb, #3b82f6); 
    color: white;
    font-weight: 700;
    padding: 0.875rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    letter-spacing: 0.5px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px); /* Efeito sutil de levitação */
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.5);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #94a3b8;
    box-shadow: none;
}

/* Mensagem de Erro */
.error-alert {
    background-color: #fef2f2;
    color: #ef4444;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
    border: 1px solid #fecaca;
    margin-bottom: 1rem;
}
</style>