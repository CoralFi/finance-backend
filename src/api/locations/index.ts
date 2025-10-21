import { Router } from "express";
import { getCountriesController } from "./getCountriesController";
import { getStatesByCountryController } from "./getStatesByCountryController";

import { getCitiesByStateController } from "./getCitiesByStateController";
const router = Router();

router.get('/', getCountriesController);
router.get('/:countryId', getStatesByCountryController);
router.get('/:countryId/:stateId', getCitiesByStateController);


export default router;
