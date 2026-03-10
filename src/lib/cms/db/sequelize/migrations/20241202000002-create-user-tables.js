/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Drop views first if they exist (they depend on tables we're modifying)
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS user_statistics CASCADE;').catch(() => {});
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS user_security_summary CASCADE;').catch(() => {});
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS users_management_view CASCADE;').catch(() => {});

    // Ensure update_updated_at_column function exists
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create users table or add missing columns if it exists
    const usersTable = await queryInterface.describeTable('users').catch(() => null);
    if (!usersTable) {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        first_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        last_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        email_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        email_verification_token: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        email_verification_expires: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        password_salt: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        password_reset_token: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        password_reset_expires: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        password_changed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        role: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'user',
        },
        status: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'pending',
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        tenant_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        is_super_admin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        failed_login_attempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        locked_until: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        last_login: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        last_login_ip: {
          type: Sequelize.INET,
          allowNull: true,
        },
        last_activity: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        two_factor_enabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        two_factor_secret: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        backup_codes: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: true,
        },
        login_notifications: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        security_questions: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        profile_data: {
          type: Sequelize.JSONB,
          defaultValue: {},
        },
        preferences: {
          type: Sequelize.JSONB,
          defaultValue: {},
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
      });

      // Add check constraints
      await queryInterface.sequelize.query(`
        ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('admin', 'editor', 'user', 'viewer'));
      `).catch(() => {}); // Ignore if constraint already exists

      await queryInterface.sequelize.query(`
        ALTER TABLE users ADD CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'inactive', 'pending', 'rejected', 'suspended'));
      `).catch(() => {});

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      // Create indexes
      await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' }).catch(() => {});
      await queryInterface.addIndex('users', ['uuid'], { name: 'idx_users_uuid' }).catch(() => {});
      await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' }).catch(() => {});
      await queryInterface.addIndex('users', ['status'], { name: 'idx_users_status' }).catch(() => {});
      await queryInterface.addIndex('users', ['is_active'], { name: 'idx_users_is_active' }).catch(() => {});
      await queryInterface.addIndex('users', ['last_activity'], { name: 'idx_users_last_activity' }).catch(() => {});
      await queryInterface.addIndex('users', ['created_at'], { name: 'idx_users_created_at' }).catch(() => {});
      await queryInterface.addIndex('users', ['tenant_id'], { name: 'idx_users_tenant_id' }).catch(() => {});
    } else {
      // Table exists - add missing columns only
      const existingColumns = Object.keys(usersTable);
      
      // Add missing columns (only if they don't exist)
      if (!existingColumns.includes('uuid')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid() UNIQUE
        `).catch(() => {});
      }
      if (!existingColumns.includes('email_verified')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false
        `).catch(() => {});
      }
      if (!existingColumns.includes('email_verification_token')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)
        `).catch(() => {});
      }
      if (!existingColumns.includes('email_verification_expires')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE
        `).catch(() => {});
      }
      if (!existingColumns.includes('password_salt')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt VARCHAR(255) NOT NULL DEFAULT ''
        `).catch(() => {});
      }
      if (!existingColumns.includes('password_reset_token')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255)
        `).catch(() => {});
      }
      if (!existingColumns.includes('password_reset_expires')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE
        `).catch(() => {});
      }
      if (!existingColumns.includes('password_changed_at')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        `).catch(() => {});
      }
      if (!existingColumns.includes('last_login_ip')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip INET
        `).catch(() => {});
      }
      if (!existingColumns.includes('last_activity')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        `).catch(() => {});
      }
      if (!existingColumns.includes('two_factor_enabled')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false
        `).catch(() => {});
      }
      if (!existingColumns.includes('two_factor_secret')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255)
        `).catch(() => {});
      }
      if (!existingColumns.includes('backup_codes')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT[]
        `).catch(() => {});
      }
      if (!existingColumns.includes('login_notifications')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS login_notifications BOOLEAN DEFAULT true
        `).catch(() => {});
      }
      if (!existingColumns.includes('security_questions')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS security_questions JSONB
        `).catch(() => {});
      }
      if (!existingColumns.includes('profile_data')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'
        `).catch(() => {});
      }
      if (!existingColumns.includes('preferences')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'
        `).catch(() => {});
      }
      if (!existingColumns.includes('created_by')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)
        `).catch(() => {});
      }
      if (!existingColumns.includes('updated_by')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id)
        `).catch(() => {});
      }

      // Add constraints if they don't exist
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
          ) THEN
            ALTER TABLE users ADD CONSTRAINT users_role_check 
            CHECK (role IN ('admin', 'editor', 'user', 'viewer'));
          END IF;
        END $$;
      `).catch(() => {});

      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'users_status_check'
          ) THEN
            ALTER TABLE users ADD CONSTRAINT users_status_check 
            CHECK (status IN ('active', 'inactive', 'pending', 'rejected', 'suspended'));
          END IF;
        END $$;
      `).catch(() => {});

      // Ensure trigger exists
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      // Add indexes if they don't exist
      await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' }).catch(() => {});
      await queryInterface.addIndex('users', ['uuid'], { name: 'idx_users_uuid' }).catch(() => {});
      await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' }).catch(() => {});
      await queryInterface.addIndex('users', ['status'], { name: 'idx_users_status' }).catch(() => {});
      await queryInterface.addIndex('users', ['is_active'], { name: 'idx_users_is_active' }).catch(() => {});
      await queryInterface.addIndex('users', ['last_activity'], { name: 'idx_users_last_activity' }).catch(() => {});
      await queryInterface.addIndex('users', ['created_at'], { name: 'idx_users_created_at' }).catch(() => {});
      await queryInterface.addIndex('users', ['tenant_id'], { name: 'idx_users_tenant_id' }).catch(() => {});
    }

    // Create user_sessions table
    const userSessionsTable = await queryInterface.describeTable('user_sessions').catch(() => null);
    if (!userSessionsTable) {
      await queryInterface.createTable('user_sessions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        session_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        jwt_token_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        refresh_token_hash: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        device_info: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        location_info: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        last_activity: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      await queryInterface.addIndex('user_sessions', ['session_id'], { name: 'idx_user_sessions_session_id' });
      await queryInterface.addIndex('user_sessions', ['user_id'], { name: 'idx_user_sessions_user_id' });
      await queryInterface.addIndex('user_sessions', ['expires_at'], { name: 'idx_user_sessions_expires_at' });
      await queryInterface.addIndex('user_sessions', ['is_active'], { name: 'idx_user_sessions_is_active' });
    }

    // Create user_activity_log table
    const userActivityLogTable = await queryInterface.describeTable('user_activity_log').catch(() => null);
    if (!userActivityLogTable) {
      await queryInterface.createTable('user_activity_log', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        session_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        action: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        resource_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        resource_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        details: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        success: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        error_message: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        risk_score: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      await queryInterface.addIndex('user_activity_log', ['user_id'], { name: 'idx_user_activity_user_id' });
      await queryInterface.addIndex('user_activity_log', ['action'], { name: 'idx_user_activity_action' });
      await queryInterface.addIndex('user_activity_log', ['created_at'], { name: 'idx_user_activity_created_at' });
      await queryInterface.addIndex('user_activity_log', ['ip_address'], { name: 'idx_user_activity_ip_address' });
    }

    // Create user_permissions table
    const userPermissionsTable = await queryInterface.describeTable('user_permissions').catch(() => null);
    if (!userPermissionsTable) {
      await queryInterface.createTable('user_permissions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        permission: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        resource_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        resource_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        granted_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        granted_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
      });

      // Add unique constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE user_permissions 
        ADD CONSTRAINT user_permissions_unique 
        UNIQUE (user_id, permission, resource_type, resource_id);
      `).catch(() => {});

      await queryInterface.addIndex('user_permissions', ['user_id'], { name: 'idx_user_permissions_user_id' });
      await queryInterface.addIndex('user_permissions', ['permission'], { name: 'idx_user_permissions_permission' });
      await queryInterface.addIndex('user_permissions', ['is_active'], { name: 'idx_user_permissions_is_active' });
    }

    // Create user_login_history table
    const userLoginHistoryTable = await queryInterface.describeTable('user_login_history').catch(() => null);
    if (!userLoginHistoryTable) {
      await queryInterface.createTable('user_login_history', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        login_time: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        location_country: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        location_city: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        device_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        browser: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        success: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        failure_reason: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        two_factor_used: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        session_duration: {
          type: Sequelize.INTEGER, // Duration in seconds
          allowNull: true,
        },
      });

      await queryInterface.addIndex('user_login_history', ['user_id'], { name: 'idx_user_login_history_user_id' });
      await queryInterface.addIndex('user_login_history', ['login_time'], { name: 'idx_user_login_history_login_time' });
      await queryInterface.addIndex('user_login_history', ['ip_address'], { name: 'idx_user_login_history_ip_address' });
    }

    // Create user_password_history table
    const userPasswordHistoryTable = await queryInterface.describeTable('user_password_history').catch(() => null);
    if (!userPasswordHistoryTable) {
      await queryInterface.createTable('user_password_history', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        password_salt: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      await queryInterface.addIndex('user_password_history', ['user_id'], { name: 'idx_user_password_history_user_id' });
      await queryInterface.addIndex('user_password_history', ['created_at'], { name: 'idx_user_password_history_created_at' });
    }

    // Create security_events table
    const securityEventsTable = await queryInterface.describeTable('security_events').catch(() => null);
    if (!securityEventsTable) {
      await queryInterface.createTable('security_events', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        event_type: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        severity: {
          type: Sequelize.STRING(20),
          defaultValue: 'low',
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        additional_data: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        resolved: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        resolved_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        resolved_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Add check constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE security_events ADD CONSTRAINT security_events_severity_check 
        CHECK (severity IN ('low', 'medium', 'high', 'critical'));
      `).catch(() => {});

      await queryInterface.addIndex('security_events', ['user_id'], { name: 'idx_security_events_user_id' });
      await queryInterface.addIndex('security_events', ['event_type'], { name: 'idx_security_events_event_type' });
      await queryInterface.addIndex('security_events', ['severity'], { name: 'idx_security_events_severity' });
      await queryInterface.addIndex('security_events', ['created_at'], { name: 'idx_security_events_created_at' });
    }

    // Create user_access_keys table
    const userAccessKeysTable = await queryInterface.describeTable('user_access_keys').catch(() => null);
    if (!userAccessKeysTable) {
      await queryInterface.createTable('user_access_keys', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        access_key: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        key_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        last_used_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Create trigger for updated_at
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_user_access_keys_updated_at ON user_access_keys;
        CREATE TRIGGER update_user_access_keys_updated_at 
        BEFORE UPDATE ON user_access_keys 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      await queryInterface.addIndex('user_access_keys', ['user_id'], { name: 'idx_user_access_keys_user_id' });
      await queryInterface.addIndex('user_access_keys', ['access_key'], { name: 'idx_user_access_keys_access_key' });
      await queryInterface.addIndex('user_access_keys', ['is_active'], { name: 'idx_user_access_keys_is_active' });
      await queryInterface.addIndex('user_access_keys', ['created_at'], { name: 'idx_user_access_keys_created_at' });
    }

    // Create views
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW users_management_view AS
      SELECT 
        u.id,
        u.uuid,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.status,
        u.is_active,
        u.email_verified,
        u.two_factor_enabled,
        u.last_login,
        u.last_login_ip,
        u.failed_login_attempts,
        CASE WHEN u.locked_until > NOW() THEN true ELSE false END as is_locked,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT s.id) as active_sessions,
        COUNT(DISTINCT l.id) as total_logins
      FROM users u
      LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = true AND s.expires_at > NOW()
      LEFT JOIN user_login_history l ON u.id = l.user_id AND l.success = true
      GROUP BY u.id, u.uuid, u.first_name, u.last_name, u.email, u.role, u.status, 
               u.is_active, u.email_verified, u.two_factor_enabled, u.last_login, 
               u.last_login_ip, u.failed_login_attempts, u.locked_until, u.created_at, u.updated_at
      ORDER BY u.created_at DESC;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW user_security_summary AS
      SELECT 
        u.id,
        u.email,
        u.role,
        u.status,
        u.failed_login_attempts,
        u.last_login,
        u.two_factor_enabled,
        COUNT(DISTINCT se.id) FILTER (WHERE se.severity IN ('high', 'critical') AND se.resolved = false) as critical_events,
        COUNT(DISTINCT s.id) as active_sessions,
        MAX(l.login_time) as last_successful_login
      FROM users u
      LEFT JOIN security_events se ON u.id = se.user_id
      LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = true AND s.expires_at > NOW()
      LEFT JOIN user_login_history l ON u.id = l.user_id AND l.success = true
      GROUP BY u.id, u.email, u.role, u.status, u.failed_login_attempts, u.last_login, u.two_factor_enabled;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW user_statistics AS
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'editor' THEN 1 END) as editor_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN role = 'viewer' THEN 1 END) as viewer_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_users,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_users,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN two_factor_enabled = true THEN 1 END) as two_factor_users,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as recent_logins,
        COUNT(CASE WHEN last_activity > NOW() - INTERVAL '24 hours' THEN 1 END) as active_today
      FROM users;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS user_statistics CASCADE;');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS user_security_summary CASCADE;');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS users_management_view CASCADE;');
    await queryInterface.dropTable('user_access_keys');
    await queryInterface.dropTable('security_events');
    await queryInterface.dropTable('user_password_history');
    await queryInterface.dropTable('user_login_history');
    await queryInterface.dropTable('user_permissions');
    await queryInterface.dropTable('user_activity_log');
    await queryInterface.dropTable('user_sessions');
    await queryInterface.dropTable('users');
  }
};

