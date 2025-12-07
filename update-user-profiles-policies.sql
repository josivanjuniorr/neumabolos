-- Opção alternativa: Criar função para verificar admin (evita recursão)

-- 1. Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.user_profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- 2. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;

-- 3. Política: Usuários podem ver seu próprio perfil OU admin pode ver todos
CREATE POLICY "Users can view profiles"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- 4. Política: Usuários podem atualizar seu próprio perfil OU admin pode atualizar qualquer um
CREATE POLICY "Users can update profiles"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 5. Política: Sistema pode inserir perfis (durante signup)
CREATE POLICY "System can insert profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (true);
