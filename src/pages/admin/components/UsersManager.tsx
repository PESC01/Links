import React, { useEffect, useState } from 'react';
import { UserX, ShieldCheck, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import DialogConfirm from './DialogConfirm';

interface User {
    id: string;
    email: string;
    created_at: string;
    is_admin: boolean;
}

const UsersManager = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, userId: '', email: '' });
    const [confirmAdminChange, setConfirmAdminChange] = useState({
        isOpen: false,
        userId: '',
        email: '',
        makeAdmin: false
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Primero obtenemos todos los usuarios registrados
                const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

                if (authError) throw authError;

                if (!authUsers?.users) {
                    setUsers([]);
                    return;
                }

                // Luego obtenemos los administradores para combinar los datos
                const { data: adminRoles, error: rolesError } = await supabase
                    .from('admin_roles')
                    .select('id');

                if (rolesError) throw rolesError;

                // Crear un conjunto de IDs de administradores para búsqueda rápida
                const adminIds = new Set((adminRoles || []).map(role => role.id));

                // Combinar la información
                const formattedUsers = authUsers.users.map(user => ({
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at,
                    is_admin: adminIds.has(user.id)
                }));

                setUsers(formattedUsers);
            } catch (error) {
                console.error('Error obteniendo usuarios:', error);
                toast.error('Error al cargar los usuarios');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDeleteUser = (id: string, email: string) => {
        setConfirmDelete({
            isOpen: true,
            userId: id,
            email
        });
    };

    const handleToggleAdmin = (id: string, email: string, currentAdminStatus: boolean) => {
        setConfirmAdminChange({
            isOpen: true,
            userId: id,
            email,
            makeAdmin: !currentAdminStatus
        });
    };

    const confirmUserDelete = async () => {
        try {
            // Esta operación requiere un token de servicio, por lo que deberías
            // crear un endpoint en tu backend para manejar esto
            toast.error('Función no disponible desde el cliente. Por favor, implementa esta función en el servidor.');

            // Como alternativa temporal, puedes deshabilitar al usuario en lugar de eliminarlo
            // const { error } = await supabase.rpc('disable_user', { 
            //   user_id: confirmDelete.userId 
            // });

            // if (error) throw error;

            // setUsers(users.filter(user => user.id !== confirmDelete.userId));
            // toast.success('Usuario deshabilitado correctamente');
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            toast.error('Error al eliminar el usuario');
        } finally {
            setConfirmDelete({ isOpen: false, userId: '', email: '' });
        }
    };

    const confirmAdminStatusChange = async () => {
        try {
            if (confirmAdminChange.makeAdmin) {
                // Promover a administrador
                const { error } = await supabase.rpc('promote_to_admin', {
                    user_id: confirmAdminChange.userId
                });
                if (error) throw error;
            } else {
                // Quitar privilegios de administrador
                const { error } = await supabase.rpc('demote_from_admin', {
                    user_id: confirmAdminChange.userId
                });
                if (error) throw error;
            }

            // Actualizar la lista de usuarios
            setUsers(users.map(user =>
                user.id === confirmAdminChange.userId
                    ? { ...user, is_admin: confirmAdminChange.makeAdmin }
                    : user
            ));

            toast.success(
                confirmAdminChange.makeAdmin
                    ? 'Privilegios de administrador concedidos'
                    : 'Privilegios de administrador revocados'
            );
        } catch (error) {
            console.error('Error cambiando estado de administrador:', error);
            toast.error('Error al cambiar los privilegios del usuario');
        } finally {
            setConfirmAdminChange({ isOpen: false, userId: '', email: '', makeAdmin: false });
        }
    };

    if (loading) {
        return <p className="text-center my-8">Cargando usuarios...</p>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">Gestión de Usuarios</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de registro</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.is_admin ? 'Administrador' : 'Usuario'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleAdmin(user.id, user.email, user.is_admin)}
                                            className={`${user.is_admin ? 'text-gray-600' : 'text-purple-600'} hover:text-purple-900 mr-4`}
                                            title={user.is_admin ? 'Remover administrador' : 'Hacer administrador'}
                                        >
                                            {user.is_admin ? <Shield size={18} /> : <ShieldCheck size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Eliminar usuario"
                                        >
                                            <UserX size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No se encontraron usuarios
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <DialogConfirm
                isOpen={confirmDelete.isOpen}
                title="Eliminar usuario"
                message={`¿Estás seguro de que deseas eliminar al usuario "${confirmDelete.email}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                onConfirm={confirmUserDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, userId: '', email: '' })}
                danger={true}
            />

            <DialogConfirm
                isOpen={confirmAdminChange.isOpen}
                title={confirmAdminChange.makeAdmin ? "Conceder privilegios de administrador" : "Revocar privilegios de administrador"}
                message={`¿Estás seguro de que deseas ${confirmAdminChange.makeAdmin ? 'conceder' : 'revocar'} los privilegios de administrador de "${confirmAdminChange.email}"?`}
                confirmText="Confirmar"
                onConfirm={confirmAdminStatusChange}
                onCancel={() => setConfirmAdminChange({ isOpen: false, userId: '', email: '', makeAdmin: false })}
                danger={false}
            />
        </div>
    );
};

export default UsersManager;