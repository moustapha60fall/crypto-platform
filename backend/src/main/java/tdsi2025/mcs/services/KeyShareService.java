package tdsi2025.mcs.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tdsi2025.mcs.dto.KeyShareDTO;
import tdsi2025.mcs.mapper.KeyShareMapper;
import tdsi2025.mcs.model.KeyShare;
import tdsi2025.mcs.repository.KeyShareRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class KeyShareService {

    private final KeyShareRepository keyShareRepository;
    private final KeyShareMapper keyShareMapper;

    public KeyShareDTO save(KeyShareDTO dto) {
        KeyShare entity = keyShareMapper.toEntity(dto);
        KeyShare saved = keyShareRepository.save(entity);
        return keyShareMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<KeyShareDTO> getSharesByUser(String userId) {
        return keyShareRepository.findBySharedWithUser_Id(userId)
                .stream()
                .map(keyShareMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<KeyShareDTO> getSharesByOwner(String userId) {
        return keyShareRepository.findBySharedByUser_Id(userId)
                .stream()
                .map(keyShareMapper::toDto)
                .toList();
    }

}
