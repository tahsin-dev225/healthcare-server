
import { prisma } from "../../lib/prisma";
import { IDoctorUpdatePayload } from "./doctorInterface";
import { UserStatus } from "../../../generated/prisma/enums";
import { QueryBuilder } from "../../utils/QueryBuilders";
import { IQueryParams } from "../../interfaces/query.interface";
import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";
import { Doctor, Prisma } from "../../../generated/prisma/client";

const getAllDoctors = async (query : IQueryParams) => {
    // const doctors = await prisma.doctor.findMany({
    //     where: {
    //         isDeleted: false,
    //     },
    //     include: {
    //         user: true,
    //         specialties: {
    //             include: {
    //                 specialty: true
    //             }
    //         }
    //     }
    // })
    // return doctors;

    const queryBuilder = new  QueryBuilder<Doctor, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(
        prisma.doctor,
        query,
        {
            searchableFields : doctorSearchableFields,
            filterableFields : doctorFilterableFields
        }
    )

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted : false
        })
        .include({
            user : true,
            specialties : {
                include : {
                    specialty : true
                }
            },
        })
        .dynamicInclude(doctorIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

        console.log(result);
    return result;
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
            },
            appointments : {
                include : {
                    patient : true,
                    schedule : true,
                    prescription : true
                }
             }, 
            doctorSchedules : {
                include : {
                    schedule : true
                }
             },
             reviews : true
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

const deleteDoctor = async (id : string) => {
    const isDoctorExist = await prisma.doctor.findFirst({
      where : {
            id,
            isDeleted : false
        }
    })

    if (!isDoctorExist) {
        throw new Error("Doctor not found");
    }

    await prisma.$transaction(async(tx)=> {
        await tx.doctor.update({
            where : {
                id
            },
            data : {
                isDeleted : true,
                deletedAt : new Date()
            }
        })

        await tx.user.update({
            where : {
                id : isDoctorExist.userId
            },
            data : {
                isDeleted : true,
                deletedAt : new Date(),
                status : UserStatus.DELETED
            }
        })

        await tx.session.deleteMany({
            where : {
                userId : isDoctorExist.userId
            }
        })

        await tx.doctorSpecialty.deleteMany({
            where : {
                doctorId : id
            }
        })
    })


    return {message : "Doctor deleted successfully"};
}

export const doctorService = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
}