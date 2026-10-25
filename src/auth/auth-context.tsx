"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { RoleId, DepartmentInfo } from "@/types/common";
import { Permission, UserSession, AuthContextType } from "@/types/auth";
import { DEFAULT_USER, HOSPITAL_DEPARTMENTS, ROLE_PERMISSIONS } from "./authorization";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(DEFAULT_USER);
  const [activeDepartment, setActiveDepartmentState] = useState<DepartmentInfo>(
    DEFAULT_USER.assignedDepartment
  );
  const [activeRole, setActiveRoleState] = useState<RoleId>(DEFAULT_USER.role);

  const setActiveDepartment = (department: DepartmentInfo) => {
    setActiveDepartmentState(department);
    if (user) {
      setUser({
        ...user,
        assignedDepartment: department,
      });
    }
  };

  const setActiveRole = (role: RoleId) => {
    setActiveRoleState(role);
    if (user) {
      setUser({
        ...user,
        role: role,
        permissions: ROLE_PERMISSIONS[role] || [],
      });
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const login = (role: RoleId = activeRole, customUser?: Partial<UserSession>) => {
    const targetDept = customUser?.assignedDepartment || activeDepartment;
    const targetRole = role || customUser?.role || activeRole;
    
    setUser({
      ...DEFAULT_USER,
      ...customUser,
      role: targetRole,
      assignedDepartment: targetDept,
      permissions: customUser?.permissions || ROLE_PERMISSIONS[targetRole] || [],
    });
    
    if (customUser?.assignedDepartment) {
      setActiveDepartmentState(customUser.assignedDepartment);
    }
    if (targetRole) {
      setActiveRoleState(targetRole);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeDepartment,
        activeRole,
        isAuthenticated: !!user,
        setActiveDepartment,
        setActiveRole,
        hasPermission,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
