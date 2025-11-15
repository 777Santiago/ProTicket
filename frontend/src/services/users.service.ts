import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const usersService = {
  // Obtener información básica de un usuario por ID desde Supabase Functions
  getById: async (userId: string): Promise<UserInfo> => {
    try {
      console.log(`📊 Obteniendo info del usuario ${userId} desde Supabase Functions...`);
      
      // Obtener perfil desde el KV store de Supabase Functions
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/auth/user-profile/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ No se pudo obtener info del usuario ${userId}, status: ${response.status}`);
        return {
          id: userId,
          name: "Usuario",
          email: "",
          role: "buyer",
        };
      }

      const data = await response.json();
      console.log(`✅ Info del usuario ${userId} obtenida:`, data);
      
      return {
        id: data.id,
        name: data.name || data.email?.split('@')[0] || "Usuario",
        email: data.email || "",
        role: data.role || "buyer",
      };
    } catch (error) {
      console.error(`❌ Error fetching user info for ${userId}:`, error);
      return {
        id: userId,
        name: "Usuario",
        email: "",
        role: "buyer",
      };
    }
  },

  // Obtener información de múltiples usuarios en paralelo
  getByIds: async (userIds: string[]): Promise<Map<string, UserInfo>> => {
    const uniqueIds = [...new Set(userIds)];
    
    const usersInfoPromises = uniqueIds.map(userId => usersService.getById(userId));
    const usersInfo = await Promise.all(usersInfoPromises);
    
    const userMap = new Map<string, UserInfo>();
    usersInfo.forEach(user => {
      userMap.set(user.id, user);
    });
    
    return userMap;
  },
};