#!/usr/bin/env bash
#
# Borra las ramas remotas que el lote 0 declaró muertas.
#
# Por qué es un script y no algo ya hecho: borrar ramas remotas es destructivo y no
# se puede revisar dentro de una PR. El lote 0 decide (specs/lote-0.md, D-09) y deja
# la ejecución a una persona, después de aprobar la PR.
#
#   ./scripts/cleanup-dead-branches.sh            # dry-run: sólo informa
#   ./scripts/cleanup-dead-branches.sh --execute  # borra de verdad
#
# Es idempotente: una rama ya borrada se salta sin error.
# Y es seguro: antes de borrar, RE-VERIFICA contra origin/develop que la rama no tiene
# commits propios no contemplados. Si los tiene, la salta y avisa.

set -euo pipefail

BASE="origin/develop"
EXECUTE=false
[[ "${1:-}" == "--execute" ]] && EXECUTE=true

# Ramas sin aporte: 0 commits ahead de develop, o commits sin contenido (diff vacío).
# Se espera de ellas exactamente 0 commits propios.
DEAD_EMPTY=(
  "claude/great-archimedes-5f008a"          # 3 ahead pero diff vacío vs develop (merge squash PR #24)
  "copilot/delegate-to-cloud-agent"         # 1 commit "Initial plan", diff vacío
  "copilot/update-copilot-instructions"     # 1 commit "Initial plan", diff vacío
  "copilot/fix-release-workflow-error"      # 0 ahead
  "copilot/fix-uncommitted-changes-detected" # 0 ahead
  "copilot/update-react-version-19-0-1"     # 0 ahead
  "feat/tw-theme"                           # 0 ahead
  "feat/v1"                                 # 0 ahead
)

# Ramas con commits propios pero cuyo contenido útil ya está rescatado o es redundante.
# Aquí sí se esperan commits ahead: la justificación está en specs/lote-0.md §6.
DEAD_SALVAGED=(
  "copilot/update-tw-theme-readme"          # README rescatado a @docs/salvage/
  "copilot/update-react-to-19-0-3"          # fixture rescatado a @docs/salvage/; bump descartado (D-08)
  "copilot/update-react-versions-to-19-0-3" # mismo bump, sin contenido único
)

# NO se borran, a propósito:
#   components           -> conserva la paleta de marca, pendiente de decisión P-02
#   tw-theme/v1          -> conserva el cambio de semántica :where(root), pendiente de P-01
#   changeset-release/main -> la regenera Changesets sola; no se toca a mano
KEEP=("components" "tw-theme/v1" "changeset-release/main")

echo "Reconciliación de ramas — lote 0"
echo "Base de comparación: $BASE"
$EXECUTE || echo ">>> DRY-RUN. Nada se borra. Añade --execute para borrar de verdad."
echo

git fetch origin --prune --quiet

remote_has() { git ls-remote --exit-code --heads origin "$1" >/dev/null 2>&1; }

delete_branch() {
  local branch="$1"
  if $EXECUTE; then
    git push origin --delete "$branch" >/dev/null 2>&1 \
      && echo "   BORRADA" \
      || echo "   ERROR al borrar (¿protegida? ¿sin permisos?)"
  else
    echo "   se borraría"
  fi
}

for branch in "${DEAD_EMPTY[@]}"; do
  echo "[$branch]"
  if ! remote_has "$branch"; then echo "   ya no existe, se salta"; continue; fi
  ahead=$(git rev-list --count "$BASE..origin/$branch")
  if [[ "$ahead" -eq 0 ]]; then
    echo "   0 commits ahead de $BASE"
    delete_branch "$branch"
  # Dos pruebas distintas, cualquiera de las dos basta para dar la rama por muerta:
  #
  #  - tres puntos (BASE...rama): "que aporta la rama sobre la base comun". Vacio =>
  #    sus commits no cambian nada (p.ej. un "Initial plan" sin contenido).
  #  - dos puntos (BASE rama): "en que difiere el arbol". Vacio => la rama tiene
  #    exactamente el contenido de develop, aunque su historia sea distinta
  #    (p.ej. una rama ya mergeada con squash).
  #
  # No se pueden intercambiar: una rama 40 commits detras tiene el dos-puntos lleno
  # de lo que le FALTA, y una rama ya mergeada con squash tiene el tres-puntos lleno
  # de lo que ya esta en develop.
  elif [[ -z "$(git diff --name-only "$BASE...origin/$branch")" ]]; then
    echo "   $ahead commit(s) ahead que no aportan ningun cambio sobre la base comun"
    delete_branch "$branch"
  elif [[ -z "$(git diff --name-only "$BASE" "origin/$branch")" ]]; then
    echo "   $ahead commit(s) ahead pero su arbol es identico a $BASE (ya mergeada)"
    delete_branch "$branch"
  else
    echo "   ¡OJO! $ahead commit(s) ahead que SI aportan cambios. SE SALTA."
    echo "   Revisar a mano: git diff $BASE...origin/$branch"
  fi
done

for branch in "${DEAD_SALVAGED[@]}"; do
  echo "[$branch]"
  if ! remote_has "$branch"; then echo "   ya no existe, se salta"; continue; fi
  ahead=$(git rev-list --count "$BASE..origin/$branch")
  echo "   $ahead commit(s) ahead — contenido útil ya rescatado (specs/lote-0.md §6)"
  delete_branch "$branch"
done

echo
echo "Se conservan a propósito:"
for branch in "${KEEP[@]}"; do
  remote_has "$branch" && echo "   $branch" || echo "   $branch (ya no existe)"
done
echo
echo "Ramas remotas restantes:"
git ls-remote --heads origin | awk '{print "   "$2}' | sed 's|refs/heads/||'
