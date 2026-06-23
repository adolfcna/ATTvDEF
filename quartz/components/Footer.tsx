import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"

export default (() => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const year = new Date().getFullYear()

    return (
      <footer class={`${displayClass ?? ""}`}>
        <p>
          © {year} ATTvDEF | Offensive Security • Defensive Intelligence | CNA
        </p>
        <ul>
          <li>
            <a href="https://github.com/adolfcna">GitHub</a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/adolfcna/">LinkedIn</a>
          </li>
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
