export const UserUtils = {
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
  getUserId: () => {
    const user = UserUtils.getCurrentUser();
    return user?.userId || user?._id || user?.id || null;
  },
  getUsername: () => {
    const user = UserUtils.getCurrentUser();
    return user?.username || "Invitado";
  }
};