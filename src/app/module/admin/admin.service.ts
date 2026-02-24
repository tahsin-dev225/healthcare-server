// get all admin
// get admin by id
// update admin
// delete admin (soft delete)

import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma"
import { IUpdateAdminPayload } from "./admin.interface";

const getAllAdmins = async () => {
    const admins = await prisma.admin.findMany({
        where : {
            isDeleted : false
        },
        include : {
          user : true
        }
    })

    return admins;
}


const getAdminById = async ( id : string ) => {
    const admin = await prisma.admin.findFirst({
        where : {
            id,
            isDeleted : false
        },
        include : {
          user : true
        }
    })
    return admin;
}

const updateAdmin = async ( id : string, payload : IUpdateAdminPayload ) => {
    const isAdminExist = await prisma.admin.findFirst({
        where : {
            id,
            isDeleted : false
        }
    })

    if(!isAdminExist){
        throw new Error("Admin not found");
    }

    const {admin} = payload;
    
    const updatedAdmin = await prisma.admin.update({
        where : {
            id
        },
        data : {
            ...admin
        }
    })  
  return updatedAdmin;
}

const deleteAdmin = async ( id : string, user : IRequestUser ) => {
    const isAdminExist = await prisma.admin.findFirst({
        where : {
            id,
            isDeleted : false
        }
    })

    if(!isAdminExist){
        throw new Error("Admin not found");
    }

    if(isAdminExist.userId === user.userId){
        throw new Error("You cannot delete your own admin account");
    };

    const deletedAdmin = await prisma.admin.update({
        where : {
            id
        },
        data : {
            isDeleted : true
        }
    })

  return deletedAdmin;
}



export const adminService = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
}