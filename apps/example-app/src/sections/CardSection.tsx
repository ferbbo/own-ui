import { Badge, Button, Card } from "@ownui/ui";
import type { CardSize, CardTheme, CardVariant } from "@ownui/ui";
import { Row, Section } from "../layout";

const THEMES: CardTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

/** `undefined` es la superficie por defecto: borde difuminado y sombra mínima. */
const VARIANTS: (CardVariant | undefined)[] = [undefined, "elevated", "outlined", "ghost"];

const SIZES: CardSize[] = ["xs", "sm", "md", "lg", "xl"];

export function CardSection() {
  return (
    <Section
      id="card"
      title="Card"
      description="Superficie de agrupación. El rol no pinta el relleno: colorea el borde, los
        separadores de las partes y el anillo de foco, porque el contenido de un card es
        arbitrario y no se puede repintar con el -content del rol. Es el componente que
        consume la escala base-100/200/300 del lote 4."
    >
      <Row label="anatomía completa">
        <div className="w-80">
          <Card theme="info" variant="elevated">
            <Card.Header>
              <Card.Title as="h3">Plan Pro</Card.Title>
              <Badge theme="info" variant="soft" size="sm">
                24 €/mes
              </Badge>
            </Card.Header>
            <Card.Body>
              <p className="m-0 text-sm opacity-80">
                Cabecera, cuerpo y pie son subcomponentes estáticos: el tamaño y el rol les llegan
                por la cascada de custom properties, no por contexto de React.
              </p>
            </Card.Body>
            <Card.Footer>
              <Button theme="neutral" variant="outline" size="sm">
                Comparar
              </Button>
              <Button theme="primary" size="sm">
                Contratar
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </Row>

      <Row label="tratamientos del marco">
        {VARIANTS.map((variant) => (
          <div key={variant ?? "base"} className="w-48">
            <Card theme="primary" variant={variant}>
              <Card.Header>
                <Card.Title>{variant ?? "(por defecto)"}</Card.Title>
              </Card.Header>
              <Card.Body>Sombra y borde.</Card.Body>
            </Card>
          </div>
        ))}
      </Row>

      <Row label="8 roles sobre el borde">
        {THEMES.map((theme) => (
          <div key={theme} className="w-40">
            <Card theme={theme} variant="outlined">
              <Card.Body>{theme}</Card.Body>
            </Card>
          </div>
        ))}
      </Row>

      <Row label="tamaños">
        {SIZES.map((size) => (
          <div key={size} className="w-40">
            <Card theme="neutral" size={size}>
              <Card.Header>
                <Card.Title>{size}</Card.Title>
              </Card.Header>
              <Card.Body>Padding y tipografía.</Card.Body>
            </Card>
          </div>
        ))}
      </Row>

      <Row label='accionable: sólo as="a" y as="button"'>
        <div className="w-56">
          <Card as="a" href="#card" theme="primary">
            <Card.Header>
              <Card.Title>Enlace</Card.Title>
            </Card.Header>
            <Card.Body>Tabula, se enfoca y responde a Enter.</Card.Body>
          </Card>
        </div>
        <div className="w-56">
          <Card as="button" theme="accent">
            <Card.Header>
              <Card.Title>Botón</Card.Title>
            </Card.Header>
            <Card.Body>Un div nunca recibe el tratamiento.</Card.Body>
          </Card>
        </div>
      </Row>
    </Section>
  );
}
