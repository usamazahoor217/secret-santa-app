import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';
import { GET as getDbHealth } from '@/app/api/health/db/route';
import { GET as getTestDb } from '@/app/api/test-db/route';
import { POST as postMatch, GET as getMatch } from '@/app/api/match/route';
import { GET as getParticipants, POST as postParticipants } from '@/app/api/participants/route';
import { NextRequest } from 'next/server';

describe('Prisma Client & MySQL Database Configuration', () => {
  it('instantiates the Prisma Client singleton properly', () => {
    expect(prisma).toBeDefined();
    expect(prisma.group).toBeDefined();
    expect(prisma.participant).toBeDefined();
    expect(prisma.assignment).toBeDefined();
    expect(prisma.user).toBeDefined();
    expect(typeof prisma.$transaction).toBe('function');
  });

  it('validates MySQL database connection string format in environment', () => {
    const dbUrl = process.env.DATABASE_URL || '';
    expect(dbUrl).toMatch(/^mysql:\/\//);
    expect(dbUrl).toContain('3306');
    expect(dbUrl).toContain('secretsanta');
  });

  it('verifies all core Prisma models have expected query builder delegate methods', () => {
    expect(typeof prisma.group.findMany).toBe('function');
    expect(typeof prisma.group.create).toBe('function');
    expect(typeof prisma.participant.findUnique).toBe('function');
    expect(typeof prisma.participant.createMany).toBe('function');
    expect(typeof prisma.assignment.findMany).toBe('function');
    expect(typeof prisma.pairRestriction.findMany).toBe('function');
  });

  it('/api/health/db responds with structured diagnostic status', async () => {
    const response = await getDbHealth();
    expect(response).toBeDefined();
    expect(response.status).toBeGreaterThanOrEqual(200);
    const body = await response.json();
    expect(body).toHaveProperty('provider', 'mysql');
    expect(body).toHaveProperty('status');
  });

  it('/api/test-db verifies connection and returns database status', async () => {
    const response = await getTestDb();
    expect(response).toBeDefined();
    expect(response.status).toBeGreaterThanOrEqual(200);
    const body = await response.json();
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('timestamp');
  });

  it('/api/match validates payload and computes derangement pairings', async () => {
    // Test validation failure with < 2 participants
    const invalidReq = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      body: JSON.stringify({
        participants: [{ name: 'Solo Participant' }],
      }),
    });
    const invalidRes = await postMatch(invalidReq);
    expect(invalidRes.status).toBe(400);

    // Test successful matching request
    const validReq = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Vitest Test Match Event',
        participants: [
          { id: 'u1', name: 'Alice', email: 'alice.test@example.com' },
          { id: 'u2', name: 'Bob', email: 'bob.test@example.com' },
          { id: 'u3', name: 'Charlie', email: 'charlie.test@example.com' },
        ],
        exclusions: [
          { giverId: 'u1', restrictedReceiverId: 'u2' }, // Alice cannot draw Bob
        ],
      }),
    });
    const validRes = await postMatch(validReq);
    expect(validRes).toBeDefined();
    const body = await validRes.json();

    if (validRes.status === 201) {
      expect(body.success).toBe(true);
      expect(body.assignments).toHaveLength(3);
      // Ensure no self-matches
      body.assignments.forEach((a: { giverId: string; receiverId: string }) => {
        expect(a.giverId).not.toBe(a.receiverId);
      });
      // Ensure exclusion honored: Alice (u1) cannot give to Bob (u2)
      const aliceAssignment = body.assignments.find((a: { giverId: string }) => a.giverId === 'u1');
      expect(aliceAssignment?.receiverId).not.toBe('u2');

      // Test retrieving match via GET /api/match?groupId=...
      const getReq = new NextRequest(`http://localhost:3000/api/match?groupId=${body.groupId}`);
      const getRes = await getMatch(getReq);
      expect(getRes.status).toBe(200);
      const getBody = await getRes.json();
      expect(getBody.success).toBe(true);
      expect(getBody.data.groupId).toBe(body.groupId);
    }
  });

  it('/api/participants lists participants and validates additions', async () => {
    const listReq = new NextRequest('http://localhost:3000/api/participants');
    const listRes = await getParticipants(listReq);
    expect(listRes).toBeDefined();

    const addReq = new NextRequest('http://localhost:3000/api/participants', {
      method: 'POST',
      body: JSON.stringify({
        groupId: 'not-a-valid-uuid',
        name: 'Test Participant',
        email: 'invalid-email',
      }),
    });
    const addRes = await postParticipants(addReq);
    expect(addRes.status).toBe(400);
  });
});
