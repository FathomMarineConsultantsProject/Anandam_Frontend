// ADD THIS EXPORT to:
// src/controllers/practitionerOnboarding.controller.ts

export const getPractitionerOnboardingSpecialties = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const specialties = await prisma.specialty.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
      },
    });

    return res.status(200).json({ specialties });
  } catch (error) {
    console.error("getPractitionerOnboardingSpecialties:", error);
    return res.status(500).json({ message: "Unable to load specialties" });
  }
};

// THEN update src/routes/practitionerOnboarding.route.ts:
// 1) add getPractitionerOnboardingSpecialties to the controller import
// 2) add this route AFTER role middleware:
//
// router.get(
//   "/specialties",
//   getPractitionerOnboardingSpecialties
// );
