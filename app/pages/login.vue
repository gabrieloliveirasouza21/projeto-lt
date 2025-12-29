<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

useHead({
    title: 'Login'
})

const { login } = useAuth();
const router = useRouter();
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
                <h1 class="title">Dashboard Nanocosmo</h1>
                <p class="subtitle">Faça Login Para Continuar</p>
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

.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 1rem;
}

.login-card {
    background: rgba(255, 255, 255, 0.95);
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.3), 0 8px 10px -6px rgba(15, 23, 42, 0.2);
    backdrop-filter: blur(10px);
}

.card-header {
    text-align: center;
    margin-bottom: 2rem;
}

.title {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1e3a8a; 
    margin: 0 0 0.5rem 0;
}

.subtitle {
    color: #64748b;
    font-size: 0.95rem;
    margin: 0;
}

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
    color: #334155; 
}

input {
    padding: 0.75rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    outline: none;
    background-color: #f8fafc;
}

input:focus {
    border-color: #3b82f6;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

input::placeholder {
    color: #94a3b8;
}

.submit-btn {
    margin-top: 0.5rem;
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
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.5);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #94a3b8;
    box-shadow: none;
}

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