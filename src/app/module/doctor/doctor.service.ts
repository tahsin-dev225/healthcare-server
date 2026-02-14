import { prisma } from "../../lib/prisma";
import { IDoctorUpdatePayload } from "./doctorInterface";

const getAllDoctors = async () => {
    const doctors = await prisma.doctor.findMany({
        where: {
            isDeleted: false,
        },
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    })
    return doctors;
}

const getDoctorById = async (id : string,) => {
    const doctor = await prisma.doctor.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    })
    return doctor;
}

const updateDoctor = async (id : string, payload : IDoctorUpdatePayload) => {
      const isDoctorExist = await prisma.doctor.findFirst({
        where : {
            id,
            isDeleted : false
        }
      })

      if (!isDoctorExist) {
        throw new Error("Doctor not found");
      }

    const {doctor : doctorData, specialties } = payload;

    await prisma.$transaction(async (tx) => {
        if (doctorData) {
            await tx.doctor.update({
                where: {
                    id,
                },
                data: {
                    ...doctorData,
                }
            })
        }

        if (specialties && specialties.length > 0) {
            for (const specialty of specialties) {
                const { specialtyId, shouldDelete } = specialty;
                if (shouldDelete) {
                    await tx.doctorSpecialty.delete({
                        where: {
                            doctorId_specialtyId: {
                                doctorId: id,
                                specialtyId,
                            }
                        }
                    })
                } else {
                    await tx.doctorSpecialty.upsert({
                        where: {
                            doctorId_specialtyId: {
                                doctorId: id,
                                specialtyId,
                            }
                        },
                        create: {
                            doctorId: id,
                            specialtyId,
                        },
                        update: {}
                    })
                }
            }
        }
    })
    const doctor = await getDoctorById(id);

    return doctor;
}

export const doctorService = {
    getAllDoctors,
    getDoctorById,
    updateDoctor
}