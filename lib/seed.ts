import { getDb } from './db'
import { schools, locations, users } from './schema'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  const db = getDb()

  try {
    // Seed schools
    const schoolsData = [
      { id: 'kwasu', name: 'Kwara State University', city: 'Malete', state: 'Kwara' },
      { id: 'unilorin', name: 'University of Ilorin', city: 'Ilorin', state: 'Kwara' },
      { id: 'oau', name: 'Obafemi Awolowo University', city: 'Ile-Ife', state: 'Osun' },
      { id: 'ui', name: 'University of Ibadan', city: 'Ibadan', state: 'Oyo' },
      { id: 'unn', name: 'University of Nigeria, Nsukka', city: 'Nsukka', state: 'Enugu' },
      { id: 'uniben', name: 'University of Benin', city: 'Benin City', state: 'Edo' },
    ]

    await db.insert(schools).values(schoolsData).onConflictDoNothing()

    // Seed locations for KWASU
    const locationsData = [
      {
        schoolId: 'kwasu',
        name: 'Westend',
        latitude: '8.9644',
        longitude: '4.7844'
      },
      {
        schoolId: 'kwasu',
        name: 'Safari',
        latitude: '8.9654',
        longitude: '4.7854'
      },
      {
        schoolId: 'kwasu',
        name: 'Chapel Road',
        latitude: '8.9634',
        longitude: '4.7834'
      }
    ]

    await db.insert(locations).values(locationsData).onConflictDoNothing()

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    await db.insert(users).values({
      email: 'admin@k-hostel.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      verifiedStatus: true,
    }).onConflictDoNothing()

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}