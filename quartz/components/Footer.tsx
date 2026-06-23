import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"


export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
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
