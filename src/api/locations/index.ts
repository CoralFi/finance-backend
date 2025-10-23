import { Router } from "express";
import { getCountriesController } from "./getCountriesController";
import { getStatesByCountryController } from "./getStatesByCountryController";

import { getCitiesByStateController } from "./getCitiesByStateController";
const router = Router();

// /api/locations
router.get('/', getCountriesController);
// /api/locations/:countryId
router.get('/:countryId', getStatesByCountryController);
// /api/locations/:countryId/:stateId
router.get('/:countryId/:stateId', getCitiesByStateController);


export default router;
