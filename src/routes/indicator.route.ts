
import { DashboardIndicatorController } from "@/controllers/indicator.controller";
import { requireLoginedHook, requireOwnerHook } from "@/hooks/auth.hooks";

import {
    DashboardIndicatorQueryParams,
    DashboardIndicatorQueryParamsType,
    DashboardIndicatorRes,
    DashboardIndicatorResType
} from "@/schemaValidations/indicator.schema";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default async function indicatorRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.addHook('preValidation', fastify.auth([requireLoginedHook, requireOwnerHook]))
    fastify.get<{ Reply: DashboardIndicatorResType, Querystring: DashboardIndicatorQueryParamsType }>(
        '/dashboard', {
        schema: {
            response: {
                200: DashboardIndicatorRes
            },
            querystring: DashboardIndicatorQueryParams
        }
    },
        async (request, reply) => {
            const queryString = request.query
            const result = await DashboardIndicatorController(queryString)
            reply.send({
                message: 'Lấy các chỉ số thành công',
                data: result as unknown as DashboardIndicatorResType['data']
            })
        }
    )
}