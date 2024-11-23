import { GET } from '@/app/api/debank/route'
import { describe, it, expect } from 'vitest'

describe('DeBankAPI', () => {
  it('requires address parameter', async () => {
    const request = new Request('http://localhost/api/debank')
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns mock data for valid address', async () => {
    const request = new Request('http://localhost/api/debank?address=0x123')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.total_usd).toBeDefined()
    expect(data.chain_list).toBeDefined()
  })

  it('handles chain_id parameter', async () => {
    const request = new Request('http://localhost/api/debank?address=0x123&chain_id=base')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.id).toBe('base')
  })
}) 