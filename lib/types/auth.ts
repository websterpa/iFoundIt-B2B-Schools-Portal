export type AdminRole = 'school_admin' | 'ifoundit_superadmin'

export type AdminContext = {
  id: string
  organisationId: string | null
  role: AdminRole
}
