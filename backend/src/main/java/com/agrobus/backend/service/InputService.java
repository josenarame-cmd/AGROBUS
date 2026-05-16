package com.agrobus.backend.service;

import com.agrobus.backend.entity.AgriculturalInput;
import com.agrobus.backend.entity.Notification;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.AgriculturalInputRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InputService {

    private final AgriculturalInputRepository inputRepository;
    private final NotificationService notificationService;

    public AgriculturalInput createInput(AgriculturalInput input) {
        return inputRepository.save(input);
    }

    public AgriculturalInput updateInput(Long id, AgriculturalInput inputDetails) {
        AgriculturalInput input = getInputById(id);
        input.setInputName(inputDetails.getInputName());
        input.setCategory(inputDetails.getCategory());
        input.setQuantityAvailable(inputDetails.getQuantityAvailable());
        input.setUnitPrice(inputDetails.getUnitPrice());
        input.setExpirationDate(inputDetails.getExpirationDate());
        input.setLowStockThreshold(inputDetails.getLowStockThreshold());

        AgriculturalInput saved = inputRepository.save(input);

        if (saved.isLowStock()) {
            notificationService.createNotification(
                    "Low Stock Alert",
                    input.getInputName() + " stock is low (" + input.getQuantityAvailable() + " remaining)",
                    Notification.NotificationType.LOW_STOCK,
                    null, "ADMIN"
            );
        }

        return saved;
    }

    public void deleteInput(Long id) {
        if (!inputRepository.existsById(id)) {
            throw new ResourceNotFoundException("Input not found with id: " + id);
        }
        inputRepository.deleteById(id);
    }

    public AgriculturalInput getInputById(Long id) {
        return inputRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Input not found with id: " + id));
    }

    public List<AgriculturalInput> getAllInputs() {
        return inputRepository.findAll();
    }

    public List<AgriculturalInput> getInputsByCategory(AgriculturalInput.Category category) {
        return inputRepository.findByCategory(category);
    }

    public List<AgriculturalInput> getLowStockInputs() {
        return inputRepository.findLowStockInputs();
    }

    public AgriculturalInput distributeInput(Long id, int quantity) {
        AgriculturalInput input = getInputById(id);
        if (input.getQuantityAvailable() < quantity) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + input.getQuantityAvailable());
        }
        input.setQuantityAvailable(input.getQuantityAvailable() - quantity);
        input.setQuantityDistributed(input.getQuantityDistributed() + quantity);
        return inputRepository.save(input);
    }
}
