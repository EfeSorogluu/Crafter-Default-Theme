import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ip = searchParams.get('ip')
  const port = searchParams.get('port') || '25565'

  if (!ip) {
    return NextResponse.json({ error: 'IP gerekli' }, { status: 400 })
  }

  const isBedrock = port === '19132'
  const endpoint = isBedrock
    ? `https://mcapi.tr/api/status/${ip}:${port}?bedrock=true`
    : `https://mcapi.tr/api/status/${ip}:${port}`

  try {
    const res = await fetch(endpoint)
    if (!res.ok) {
      throw new Error('API yanıt vermedi')
    }

    const data = await res.json()

    console.log(data)

    return NextResponse.json({
      online: data.offline ? false : true,
      type: isBedrock ? 'bedrock' : 'java',
      players: data.players,
      version: data.version?.name,
      motd: data.motd?.clean,
    })
  } catch (error) {
    return NextResponse.json(
      { online: false, error: 'Sunucuya ulaşılamadı veya geçersiz yanıt.' },
      { status: 200 }
    )
  }
}