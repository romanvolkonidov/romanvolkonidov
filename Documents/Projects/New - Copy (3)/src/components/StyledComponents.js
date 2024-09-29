import styled from 'styled-components';
import DatePicker from 'react-datepicker';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const InputSection = styled.div`
  flex: 1;
  margin-right: 20px;

  @media (max-width: 768px) {
    margin-right: 0;
    width: 100%;
  }
`;

export const InvoiceSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const InvoicePreview = styled.div`
  margin: 0;
  padding: 0;
  background-color: #fff;
  width: 100%;
  overflow: auto;

  @media (max-width: 768px) {
    width: 100%;
  }

  svg {
    width: 100%;
    height: auto;
  }
`;

export const SaveButton = styled.button`
  display: block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

export const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const ItemInput = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;

  ${InputField} {
    flex: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Heading = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

export const SubHeading = styled.h3`
  margin-top: 20px;
  margin-bottom: 10px;
  color: #555;
`;
export const TemplateSelector = styled.select`
  margin: 10px 0;
  padding: 5px;
  font-size: 16px;
`;
const PipeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5cm; /* Ensure there's at least 5cm between apples */
  align-items: center;
  justify-content: flex-start;
  max-width: 100%;
  margin: 20px 0;
`;

// Styled component for the pipe background
const Pipe = styled.div`
  width: 100%;
  height: 5px;
  background-color: lightgray;
  position: relative;
  border-radius: 5px;
  margin: 10px 0;
`;

// Styled component for the filled portion of the pipe
const FilledPipe = styled.div`
  height: 100%;
  background-color: #25bad5;
  width: ${(props) => props.fillPercentage}%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 5px;
  transition: width 0.3s ease-in-out;
`;

// Styled component for each apple (milestone)
const Apple = styled.div`
  width: ${(props) => (props.isStartOrEnd ? "30px" : "10px")};
  height: ${(props) => (props.isStartOrEnd ? "30px" : "10px")};
  background-color: ${(props) => (props.reached ? "#00accb" : "gray")};
  border-radius: 50%;
  cursor: pointer;
  display: inline-block;
  border: ${(props) => (props.isStart ? "2px solid turquoise" : "none")};
  transform: translateX(-50%);
  transition: background-color 0.3s ease-in-out;
`;

// Styled component to position apples in rows like a snake (non-linear)
const AppleWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
`;