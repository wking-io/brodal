import { render } from '@testing-library/react';
import { OptionSelect } from './Generator';

const options = ['australian', 'african', 'boxer'];

describe('Generator component', () => {
  test('OptionSelect renders', () => {
    const { getByLabelText } = render(<OptionSelect options={options} label="Test Label" />);
    expect(getByLabelText('Test Label')).toBeInTheDocument();
  });

  test('OptionSelect is disabled', () => {
    const { getByTestId } = render(<OptionSelect formKey="test" options={options} label="Test Label" disabled={true} />);
    expect(getByTestId('select-test')).toHaveClass('Mui-disabled');
  });
});