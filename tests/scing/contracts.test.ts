import { getAllEngineUIContracts } from '../../scing/ui/engineContracts';

test('all engines declare report sections', () => {
  getAllEngineUIContracts().forEach((e) => {
    expect(e.reportSections.length).toBeGreaterThan(0);
  });
});
