import { ENGINE_UI_REGISTRY } from '../../scing/ui/engineContracts';

test('all engines declare report sections', () => {
  Object.values(ENGINE_UI_REGISTRY).forEach((e) => {
    expect(e.reportSections.length).toBeGreaterThan(0);
  });
});
