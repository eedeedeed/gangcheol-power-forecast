import React from 'react';

function BuildingForm({ form, onFormChange, onOtherTypeNameChange, otherTypeName, showOtherType, onAddressSearch }) {
  const buildingTypes = ['아파트', '상업', '백화점', '병원', '호텔', '전화국(IDC)', '연구소', '공공', '학교', '기타'];

  // Daum 주소 검색 API 호출 시 현재 테마에 맞게 색상을 동적으로 적용합니다.
  const handleDaumSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => onAddressSearch(data),
      theme: {
        bgColor: document.documentElement.getAttribute('data-color-scheme') === 'dark' ? "#1f2121" : "#ffffff",
        searchBgColor: document.documentElement.getAttribute('data-color-scheme') === 'dark' ? "#b5bbbbff" : "#ffffff",
        contentBgColor: document.documentElement.getAttribute('data-color-scheme') === 'dark' ? "#2c2e2e" : "#ffffff",
        textColor: document.documentElement.getAttribute('data-color-scheme') === 'dark' ? "#ffffff" : "#000000",
      }
    }).open();
  };

  // 냉방 비율 계산
  const coolingAreaNum = parseFloat(form.coolingArea);
  const totalAreaNum = parseFloat(form.area);
  let coolingRatio = '0.00';
  if (totalAreaNum > 0 && coolingAreaNum >= 0) {
    coolingRatio = ((coolingAreaNum / totalAreaNum) * 100).toFixed(2);
  }

  return (
    <div className="building-form">
      <div className="form-group">
        <label className="required">건물명</label>
        <input type="text" name="name" value={form.name} onChange={onFormChange} required placeholder="건물명을 입력하세요" className="form-control" />
      </div>
      <div className="form-group">
        <label className="required">건물유형</label>
        <select name="type" value={form.type} onChange={onFormChange} required className="form-control">
          <option value="" disabled>선택하세요</option>
          {buildingTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {showOtherType && (
        <div className="form-group">
          <label>기타 유형명</label>
          <input type="text" value={otherTypeName} onChange={onOtherTypeNameChange} placeholder="건물 유형 직접 입력" required className="form-control" />
        </div>
      )}
      <div className="form-group">
        <label className="required">연면적(㎡)</label>
        <input type="number" name="area" value={form.area} onChange={onFormChange} required placeholder="숫자만 입력" className="form-control" />
      </div>
      <div className="form-group">
        <label className="required">냉방면적(㎡)</label>
        <input type="number" name="coolingArea" value={form.coolingArea} onChange={onFormChange} required placeholder="숫자만 입력" className="form-control" />
      </div>
      <div className="form-group">
        <label>냉방 비율</label>
        <div className="readonly-input">{coolingRatio} %</div>
      </div>
      <div className="form-group">
        <label>PCS용량(kW)</label>
        <input type="number" name="pcsCapacity" value={form.pcsCapacity} onChange={onFormChange} placeholder="숫자만 입력" className="form-control" />
      </div>
      <div className="form-group">
        <label>ESS저장용량(kWh)</label>
        <input type="number" name="essCapacity" value={form.essCapacity} onChange={onFormChange} placeholder="숫자만 입력" className="form-control" />
      </div>
      <div className="form-group">
        <label>태양광용량(kW)</label>
        <input type="number" name="solarCapacity" value={form.solarCapacity} onChange={onFormChange} placeholder="숫자만 입력" className="form-control" />
      </div>
      <div className="form-group address-group">
        <label className="required">건물주소</label>
        <div className="address-container">
          <div className="zip-search">
            <input type="text" name="zipCode" value={form.zipCode} placeholder="우편번호" readOnly className="form-control" />
            <button type="button" onClick={handleDaumSearch} className="btn btn--secondary">주소 검색</button>
          </div>
          <input type="text" name="address" value={form.address} placeholder="주소" readOnly required className="form-control" />
          <input type="text" name="detailAddress" value={form.detailAddress} onChange={onFormChange} placeholder="상세주소 입력 (동, 호수 등)" className="form-control" />
        </div>
      </div>
    </div>
  );
}

export default BuildingForm;