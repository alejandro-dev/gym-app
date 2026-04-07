import { NextResponse } from "next/server";

import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import type { UpdateUserPayload } from "@/services/usersService";

type RouteContext = {
   params: Promise<{
      id: string;
   }>;
};

export async function PATCH(req: Request, context: RouteContext) {
   try {
      const { id } = await context.params;
      const body = (await req.json()) as UpdateUserPayload;

      const data = await backendFetch(`/api/users/${id}`, {
         method: "PATCH",
         body: JSON.stringify(body),
      });

      return NextResponse.json(data);
   } catch (e) {
      if (e instanceof ErrorCode) {
         return NextResponse.json({ message: e.message }, { status: e.status });
      }

      return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
   }
}

export async function DELETE(_: Request, context: RouteContext) {
   try {
      const { id } = await context.params;

      const data = await backendFetch(`/api/users/${id}`, {
         method: "DELETE",
      });

      return NextResponse.json(data);
   } catch (e) {
      if (e instanceof ErrorCode) {
         return NextResponse.json({ message: e.message }, { status: e.status });
      }

      return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
   }
}
