-- Crear tabla de reportes
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Añadir campo admin a la tabla users (usaremos metadatos de usuario de Supabase)
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Habilitar RLS en la tabla reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas para reports
CREATE POLICY "Permitir a usuarios autenticados crear reportes" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir a usuarios ver sus propios reportes" ON reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Permitir admin ver todos los reportes" ON reports
  FOR SELECT TO authenticated
  USING ((SELECT is_admin FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Permitir admin actualizar reportes" ON reports
  FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Permitir admin eliminar reportes" ON reports
  FOR DELETE TO authenticated
  USING ((SELECT is_admin FROM auth.users WHERE id = auth.uid()));