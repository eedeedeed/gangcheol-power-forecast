const db = require('../models');

async function ensurePeakThreshold(buildingId = 74) {
  await db.sequelize.query(`
    CREATE TABLE IF NOT EXISTS peak_threshold (
      BUILDING_ID INT PRIMARY KEY,
      THRESHOLD_TYPE ENUM('MU_PLUS_2SIGMA','P95') NOT NULL,
      THRESHOLD_VALUE DOUBLE NOT NULL,
      MU DOUBLE NULL,
      SIGMA DOUBLE NULL,
      UPDATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.sequelize.query(`
    INSERT INTO peak_threshold (BUILDING_ID, THRESHOLD_TYPE, THRESHOLD_VALUE, MU, SIGMA)
    SELECT ?, 'MU_PLUS_2SIGMA',
           AVG(POWER_KWH) + 2*STDDEV_SAMP(POWER_KWH),
           AVG(POWER_KWH), STDDEV_SAMP(POWER_KWH)
    FROM sim_replay_data WHERE BUILDING_ID = ?
    ON DUPLICATE KEY UPDATE
      THRESHOLD_TYPE=VALUES(THRESHOLD_TYPE),
      THRESHOLD_VALUE=VALUES(THRESHOLD_VALUE),
      MU=VALUES(MU),
      SIGMA=VALUES(SIGMA),
      UPDATED_AT=CURRENT_TIMESTAMP
  `, { replacements: [buildingId, buildingId] });
}

module.exports = { ensurePeakThreshold };
