import { useState } from "react";
import { Checkbox, CheckboxGroup, Radio, RadioGroup, Switch } from "@ownui/ui";
import type { CheckboxSize, CheckboxTheme } from "@ownui/ui";
import { Panel, Row, Section } from "../layout";

const THEMES: CheckboxTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const SIZES: CheckboxSize[] = ["xs", "sm", "md", "lg", "xl"];

const INGREDIENTES = ["Queso", "Jamón", "Piña"];

export function ControlsSection() {
  const [seleccion, setSeleccion] = useState<string[]>(["Queso"]);
  const [envio, setEnvio] = useState("estandar");
  const [oscuro, setOscuro] = useState(false);

  const todos = seleccion.length === INGREDIENTES.length;
  const algunos = seleccion.length > 0 && !todos;

  return (
    <Section
      id="controls"
      title="Checkbox, Radio y Switch"
      description="Los tres comparten la capa de tokens --control-*, que es lo que hace que a un mismo
        tamaño se alineen entre sí en un formulario. Lo que no comparten es la geometría: caja
        cuadrada, círculo y pista alargada."
    >
      <Row label="los tres al mismo tamaño (md): misma altura">
        <Checkbox defaultChecked>Casilla</Checkbox>
        <RadioGroup label="" aria-label="Opción" defaultValue="a">
          <Radio value="a">Opción</Radio>
        </RadioGroup>
        <Switch defaultChecked>Interruptor</Switch>
      </Row>

      <Row label="checkbox · theme">
        {THEMES.map((theme) => (
          <Checkbox key={theme} theme={theme} defaultChecked>
            {theme}
          </Checkbox>
        ))}
      </Row>

      <Row label="checkbox · size">
        {SIZES.map((size) => (
          <Checkbox key={size} size={size} defaultChecked>
            {size}
          </Checkbox>
        ))}
      </Row>

      <Row label="tercer estado: una casilla que manda sobre un grupo">
        <div className="flex flex-col gap-3">
          <Checkbox
            checked={todos}
            indeterminate={algunos}
            onChange={(checked) => setSeleccion(checked ? INGREDIENTES : [])}
          >
            Seleccionar todo
          </Checkbox>
          <div className="pl-6">
            <CheckboxGroup
              label="Ingredientes"
              description="Marca algunos para ver el estado parcial arriba."
              value={seleccion}
              onChange={setSeleccion}
              theme="success"
            >
              {INGREDIENTES.map((item) => (
                <Checkbox key={item} value={item}>
                  {item}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </div>
        </div>
      </Row>

      <Row label="radio · el grupo es el componente (flechas para recorrerlo)">
        <RadioGroup
          label="Envío"
          description="Tab entra al grupo; dentro se navega con las flechas."
          value={envio}
          onChange={setEnvio}
          theme="accent"
        >
          <Radio value="estandar">Estándar</Radio>
          <Radio value="rapido">Rápido</Radio>
          <Radio value="recogida" disabled>
            Recogida (no disponible)
          </Radio>
        </RadioGroup>
        <RadioGroup label="Horizontal" orientation="horizontal" defaultValue="s" theme="info">
          <Radio value="s">S</Radio>
          <Radio value="m">M</Radio>
          <Radio value="l">L</Radio>
        </RadioGroup>
        <RadioGroup label="Inválido" invalid errorMessage="Elige una opción para continuar.">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      </Row>

      <Row label="switch · theme y size">
        {THEMES.slice(0, 4).map((theme) => (
          <Switch key={theme} theme={theme} defaultChecked>
            {theme}
          </Switch>
        ))}
        {SIZES.map((size) => (
          <Switch key={size} size={size} defaultChecked>
            {size}
          </Switch>
        ))}
      </Row>

      <Row label="estados">
        <Checkbox disabled>Deshabilitado</Checkbox>
        <Checkbox disabled defaultChecked>
          Deshabilitado y marcado
        </Checkbox>
        <Checkbox readOnly defaultChecked>
          Sólo lectura
        </Checkbox>
        <Checkbox invalid>Inválido</Checkbox>
        <Switch disabled>Deshabilitado</Switch>
        <Switch disabled defaultChecked>
          Deshabilitado y encendido
        </Switch>
      </Row>

      <Panel>
        <Switch checked={oscuro} onChange={setOscuro} theme="success">
          Un switch controlado: {oscuro ? "encendido" : "apagado"}
        </Switch>
        <p className="mt-2 text-sm opacity-70">
          Un switch dice <em>esto está encendido ahora</em> y tiene efecto inmediato; una casilla
          dice <em>esta opción está seleccionada</em> y se envía con el formulario. Por eso el
          switch no tiene tercer estado.
        </p>
      </Panel>
    </Section>
  );
}
