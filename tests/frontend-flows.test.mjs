import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('T-034: carrito actualiza datos vigentes y limita cantidades al stock conocido', () => {
  const source = read('src/store/useCartStore.ts');
  assert.match(source, /price: newItem\.price/);
  assert.match(source, /stock: newItem\.stock/);
  assert.match(source, /imageUrl: newItem\.imageUrl/);
  assert.match(source, /Math\.min\(existingItem\.quantity \+ newItem\.quantity, newItem\.stock\)/);
  assert.match(source, /persist\(/);
});

test('T-034: checkout concilia productos y settings antes de crear pedido', () => {
  const source = read('src/app/(store)/checkout/page.tsx');
  assert.match(source, /fetcher<Product\[\]>\(`\/products\?ids=\$\{idsParam\}`\)/);
  assert.match(source, /fetcher<\{ shipping: \{ type: string; amount: number \| string \} \}>\('\/settings'\)/);
  assert.match(source, /setRequiresReconfirmation\(true\)/);
  assert.match(source, /No se pudo validar el carrito con datos vigentes del servidor/);
  assert.match(source, /sessionStorage\.setItem\('last-confirmed-order'/);
  assert.match(source, /orderCreatedRef\.current = true;\s*clearCart\(\)/);
  assert.match(source, /items\.length === 0 && !orderCreatedRef\.current/);
});

test('T-034: confirmación no confía solo en URL y deduplica Meta Purchase', () => {
  const source = read('src/app/(store)/checkout/exito/page.tsx');
  assert.match(source, /sessionStorage\.getItem\('last-confirmed-order'\)/);
  assert.match(source, /orderData\.orderNumber !== orderParam/);
  assert.match(source, /meta-purchase-tracked-/);
  assert.match(source, /trackMetaEvent\('Purchase'/);
  assert.match(source, /Tu pedido llegará en 1 a 3 días hábiles/);
});

test('T-034: configuración administrativa libera loading y ofrece reintento ante fallo', () => {
  const source = read('src/app/admin/configuracion/page.tsx');
  assert.match(source, /finally \{\s*setLoading\(false\);\s*\}/);
  assert.match(source, /No se pudo cargar la configuración/);
  assert.match(source, /onClick=\{loadSettings\}/);
});
