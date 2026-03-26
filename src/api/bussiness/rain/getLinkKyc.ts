import { Request, Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "@/middleware/authMiddleware";
type RainLink = {
	url?: string;
	params?: Record<string, string>;
};

const VERIFIED_STATUSES = new Set(["verified", "approved", "completed"]);

const buildFullLink = (link?: RainLink): string | null => {
	if (!link?.url) {
		return null;
	}

	if (!link.params || Object.keys(link.params).length === 0) {
		return link.url;
	}

	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(link.params)) {
		if (value !== undefined && value !== null) {
			searchParams.append(key, String(value));
		}
	}

	const separator = link.url.includes("?") ? "&" : "?";
	const query = searchParams.toString();
	return query ? `${link.url}${separator}${query}` : link.url;
};

const isVerified = (status?: string): boolean => {
	if (!status) return false;
	return VERIFIED_STATUSES.has(String(status).toLowerCase());
};

export const getLinkKycCompany = async (
	req: AuthRequest,
	res: Response
): Promise<Response> => {
	try {
		const companyId = req.user?.rain_id ??  null;
     
		if (!companyId) {
			return res.status(400).json({
				success: false,
				message: "companyId es requerido",
			});
		}

		const data = await apiRain.getCompanyLinkKyc(companyId);
		const companyStatus = data?.applicationStatus;
		const companyExternalLink = data?.applicationExternalVerificationLink;
		const companyCompletionLink = data?.applicationCompletionLink;

		const ubos = Array.isArray(data?.ultimateBeneficialOwners)
			? data.ultimateBeneficialOwners
			: [];

		const normalizedUbos = ubos.map((ubo: any) => {
			const externalLink = ubo?.applicationExternalVerificationLink;
			const completionLink = ubo?.applicationCompletionLink;
			const status = ubo?.applicationStatus;

			return {
				id: ubo?.id ?? null,
				firstName: ubo?.firstName ?? null,
				lastName: ubo?.lastName ?? null,
				email: ubo?.email ?? null,
				applicationStatus: status ?? null,
				isVerified: isVerified(status),
				hasExternalVerificationLink: Boolean(externalLink?.url),
				hasCompletionLink: Boolean(completionLink?.url),
				externalVerificationLink: {
					url: externalLink?.url ?? null,
					params: externalLink?.params ?? null,
					fullUrl: buildFullLink(externalLink),
				},
				completionLink: {
					url: completionLink?.url ?? null,
					params: completionLink?.params ?? null,
					fullUrl: buildFullLink(completionLink),
				},
			};
		});

		const verifiedUbos = normalizedUbos.filter((ubo) => ubo.isVerified).length;
		const pendingUbos = normalizedUbos.length - verifiedUbos;

		const responseData = {
			company: {
				id: data?.id ?? null,
				applicationStatus: companyStatus ?? null,
				applicationReason: data?.applicationReason ?? null,
				isVerified: isVerified(companyStatus),
				hasExternalVerificationLink: Boolean(companyExternalLink?.url),
				hasCompletionLink: Boolean(companyCompletionLink?.url),
				externalVerificationLink: {
					url: companyExternalLink?.url ?? null,
					params: companyExternalLink?.params ?? null,
					fullUrl: buildFullLink(companyExternalLink),
				},
				completionLink: {
					url: companyCompletionLink?.url ?? null,
					params: companyCompletionLink?.params ?? null,
					fullUrl: buildFullLink(companyCompletionLink),
				},
			},
			ubos: normalizedUbos,
			summary: {
				companyVerified: isVerified(companyStatus),
				totalUbos: normalizedUbos.length,
				verifiedUbos,
				pendingUbos,
				hasAnyPendingUbo: pendingUbos > 0,
				hasCompanyVerificationLink: Boolean(companyExternalLink?.url),
				hasAnyUboVerificationLink: normalizedUbos.some(
					(ubo) => ubo.hasExternalVerificationLink
				),
			},
		};

		return res.status(200).json({
			success: true,
			data: responseData,
		});
	} catch (error: any) {
		console.error("Error en getLinkKycCompany:", error.response?.data || error);

		return res.status(500).json({
			success: false,
			message: error.response?.data || "Error interno del servidor",
		});
	}
};
