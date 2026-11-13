import React from 'react'
import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { StudentWorkspace } from '@/components/students/student-workspace'

it('shows separate laptop, pouch, and inactive legacy tags for a student', () => {
  render(<StudentWorkspace students={[{
    id: 'student', firstName: 'Alice', lastName: 'Smith', dateOfBirth: null, homePostcode: null,
    yearGroup: null, className: null, active: true, parentEmail: null, trustedContacts: [], tagStatus: 'assigned', items: [
      { id: 'laptop', serial: 'HERO0001', itemKind: 'hero_laptop', laptopOwnership: 'student', active: true },
      { id: 'pouch', serial: 'POUCH0001', itemKind: 'phone_pouch', laptopOwnership: null, active: true },
      { id: 'legacy', serial: 'LEGACY01', itemKind: null, laptopOwnership: null, active: false }
    ]
  }]} createStudentAction={vi.fn()} importStudentsAction={vi.fn()} contactActions={{ save: vi.fn(), remove: vi.fn() }} />)
  expect(screen.getByText('3 items')).toBeInTheDocument()
  expect(screen.getByText(/BYOD laptop \(student owned\)/)).toBeInTheDocument()
  expect(screen.getByText(/Phone pouch/)).toBeInTheDocument()
  expect(screen.getByText(/Unclassified item/)).toHaveTextContent('Inactive')
  expect(screen.getByText('HERO0001')).toBeInTheDocument()
})
