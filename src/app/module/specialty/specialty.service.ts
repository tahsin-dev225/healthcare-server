
import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload : Specialty) : Promise<Specialty> =>{
  const Specialty = await prisma.specialty.create({
    data : payload
  })
  return Specialty;
}

const getSpecialties = async () : Promise<Specialty[]> =>{
  const specialties = await prisma.specialty.findMany();
  return specialties
}

const deleteSpecialty = async(id : string) : Promise<Specialty> => {
  const specialty = await prisma.specialty.delete({
    where : {id}
  })
  return specialty
}

export const SpecialtyService = {
  createSpecialty,
  getSpecialties,
  deleteSpecialty
}