import ChangePasswordForm from "./UI/ChangePasswordForm"
import type { SettingsData } from './data/typesprofile';

const Settings = ({ settingsData: _settingsData, onUpdateSettings: _onUpdateSettings, loading: _loading }: { settingsData?: SettingsData; onUpdateSettings?: (updatedData: Partial<SettingsData>) => Promise<void>; loading?: boolean }) => {
  return (
    <div>
        <ChangePasswordForm />
    </div>
  )
}

export default Settings