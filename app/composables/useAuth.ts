export const useAuth = () =>{
    const config = useRuntimeConfig()
    const token = useCookie('auth_token', {
        maxAge: 60 * 60 * 24
    })

    const login = async (credentials: any) =>{
        try{
            const data: any = await $fetch(`${config.public.apiBase}/api/authenticate`, {
                method: 'POST',
                body: credentials
            })
            token.value = data.token;
            return true;
        } 
        catch(error){
            console.error('erro no login:', error);
            return false;
        }
    }

    const logout = () => {
        token.value = null;
        navigateTo('/login');
    }

    return {
        token,
        login,
        logout
    }
}