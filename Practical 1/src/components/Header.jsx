function Header({ name, role }) {
  return (
    <header>
      <h1>{name}'s Portfolio</h1>
      <p>{role}</p>
    </header>
  )
}

export default Header
