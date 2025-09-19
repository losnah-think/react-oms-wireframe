import React, { useState } from "react";
import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../src/pages/api/auth/[...nextauth]";
import Container from "../../../src/design-system/components/Container";
import Card from "../../../src/design-system/components/Card";

export default function AddShopPage() {
  const [shopId, setShopId] = useState("");
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("cafe24");
  const [clientId, setClientId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const handleSubmit = async () => {
    if (!shopId) return alert("shopId required");
    try {
      const resp = await fetch(
        `/api/integrations/shops/${shopId}/credentials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform, name, clientId, accessToken }),
        },
      );
      const body = await resp.json();
      if (body?.ok) {
        alert("샾 등록 성공");
        window.location.href = "/settings/integration";
      } else alert("등록 실패");
    } catch (e) {
      alert("네트워크 오류");
    }
  };

  return (
    <Container>
      <h1>새 샵 등록</h1>
      <Card>
        <div style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="Shop ID"
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
          />
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="cafe24">Cafe24</option>
            <option value="makeshop">MakeShop</option>
            <option value="smartstore">SmartStore</option>
            <option value="wisa">Wisa</option>
            <option value="godomall">GodoMall</option>
          </select>
          <input
            placeholder="Client ID (optional)"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <input
            placeholder="Access Token (optional)"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />
          <div>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              등록
            </button>
            <Link href="/settings/integration" className="ml-2 px-3 py-1 bg-gray-200 rounded">취소</Link>
          </div>
        </div>
      </Card>
    </Container>
  );
}

export async function getServerSideProps(ctx: any) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any);
  if (!session || (session as any).user?.role !== "admin")
    return { redirect: { destination: "/login", permanent: false } };
  return { props: {} };
}
