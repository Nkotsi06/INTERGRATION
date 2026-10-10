import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <button className="accordion-header" onClick={() => toggle(index)}>
            <span>{item.title}</span>
            {openIndex === index ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openIndex === index && (
            <div className="accordion-body">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Accordion;